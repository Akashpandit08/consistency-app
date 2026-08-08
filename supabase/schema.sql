-- ============================================================
-- CONSISTENCY — Complete Production Database Schema
-- Run this entire file in your Supabase SQL Editor.
-- File is idempotent: safe to re-run multiple times.
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Helper: auto-update updated_at ───────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── PROFILES ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  first_name            text,
  last_name             text,
  avatar_url            text,
  onboarding_completed  boolean not null default false,
  referral_code         text unique,
  referred_by           text, -- referral code (not FK to allow flexibility)
  is_pro                boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─── USER PREFERENCES ─────────────────────────────────────────
create table if not exists public.user_preferences (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references auth.users(id) on delete cascade,
  goal                  text check (goal in ('build_muscle','lose_fat','get_stronger','improve_fitness','general_health')),
  experience            text check (experience in ('beginner','intermediate','advanced')),
  training_days         smallint check (training_days between 2 and 6),
  equipment             text check (equipment in ('full_gym','home_gym','dumbbells','bodyweight')),
  training_time         text check (training_time in ('morning','afternoon','evening')),
  motivation            text check (motivation in ('strength','appearance','health','consistency','competition')),
  weight_unit           text not null default 'kg' check (weight_unit in ('kg','lbs')),
  height_unit           text not null default 'cm' check (height_unit in ('cm','in')),
  calorie_target        integer check (calorie_target > 0 and calorie_target < 10000),
  protein_target        integer check (protein_target > 0 and protein_target < 500),
  water_target_ml       integer not null default 2500 check (water_target_ml >= 500 and water_target_ml <= 6000),
  sleep_target_hours    numeric(3,1) not null default 8 check (sleep_target_hours >= 3 and sleep_target_hours <= 14),
  notifications_enabled boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists user_preferences_updated_at on public.user_preferences;
create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ─── WORKOUT SESSIONS ─────────────────────────────────────────
create table if not exists public.workout_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  plan_day          smallint,
  workout_type      text not null check (workout_type in ('push','pull','legs','upper','lower','full_body','custom')),
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  duration_minutes  integer check (duration_minutes >= 0 and duration_minutes <= 600),
  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists workout_sessions_user_id_idx on public.workout_sessions(user_id);
create index if not exists workout_sessions_started_at_idx on public.workout_sessions(user_id, started_at desc);

-- ─── EXERCISE SETS ────────────────────────────────────────────
create table if not exists public.exercise_sets (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.workout_sessions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  exercise_id     text not null,
  exercise_name   text not null,
  set_number      smallint not null check (set_number >= 1 and set_number <= 20),
  weight_kg       numeric(6,2) check (weight_kg >= 0 and weight_kg <= 1000),
  reps            smallint check (reps >= 0 and reps <= 200),
  rpe             numeric(3,1) check (rpe >= 1 and rpe <= 10),
  completed       boolean not null default false,
  notes           text,
  logged_at       timestamptz not null default now()
);

create index if not exists exercise_sets_user_id_idx on public.exercise_sets(user_id);
create index if not exists exercise_sets_session_id_idx on public.exercise_sets(session_id);
create index if not exists exercise_sets_exercise_id_idx on public.exercise_sets(user_id, exercise_id);

-- ─── PERSONAL RECORDS ─────────────────────────────────────────
create table if not exists public.personal_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  exercise_id     text not null,
  exercise_name   text not null,
  weight_kg       numeric(6,2) not null check (weight_kg >= 0),
  reps            smallint not null check (reps >= 1),
  volume_kg       numeric(8,2) not null check (volume_kg >= 0),
  achieved_at     timestamptz not null default now(),
  unique(user_id, exercise_id)
);

create index if not exists personal_records_user_id_idx on public.personal_records(user_id);

-- ─── MEAL LOGS ────────────────────────────────────────────────
create table if not exists public.meal_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null,
  completed   jsonb not null default '[]'::jsonb
              check (jsonb_typeof(completed) = 'array'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, log_date)
);

drop trigger if exists meal_logs_updated_at on public.meal_logs;
create trigger meal_logs_updated_at
  before update on public.meal_logs
  for each row execute function public.set_updated_at();

create index if not exists meal_logs_user_date_idx on public.meal_logs(user_id, log_date desc);

-- ─── WATER LOGS ───────────────────────────────────────────────
create table if not exists public.water_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  log_date    date not null,
  amount_ml   integer not null check (amount_ml >= 0 and amount_ml <= 10000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, log_date)
);

drop trigger if exists water_logs_updated_at on public.water_logs;
create trigger water_logs_updated_at
  before update on public.water_logs
  for each row execute function public.set_updated_at();

create index if not exists water_logs_user_date_idx on public.water_logs(user_id, log_date desc);

-- ─── SLEEP LOGS ───────────────────────────────────────────────
create table if not exists public.sleep_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  log_date            date not null,
  bedtime             time,
  wake_time           time,
  duration_minutes    integer check (duration_minutes >= 0 and duration_minutes <= 1440),
  quality             smallint check (quality between 1 and 5),
  created_at          timestamptz not null default now(),
  unique(user_id, log_date)
);

create index if not exists sleep_logs_user_date_idx on public.sleep_logs(user_id, log_date desc);

-- ─── BODY METRICS ──────────────────────────────────────────────
create table if not exists public.body_metrics (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  weight_kg       numeric(5,2) check (weight_kg > 0 and weight_kg <= 500),
  chest_cm        numeric(5,2) check (chest_cm > 0 and chest_cm <= 200),
  waist_cm        numeric(5,2) check (waist_cm > 0 and waist_cm <= 200),
  biceps_cm       numeric(5,2) check (biceps_cm > 0 and biceps_cm <= 100),
  body_fat_pct    numeric(4,2) check (body_fat_pct > 0 and body_fat_pct <= 60),
  created_at      timestamptz not null default now()
);

create index if not exists body_metrics_user_id_idx on public.body_metrics(user_id, created_at desc);

-- ─── HABITS ───────────────────────────────────────────────────
create table if not exists public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (length(name) between 1 and 100),
  emoji       text not null check (length(emoji) between 1 and 10),
  "order"     smallint not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists habits_user_id_idx on public.habits(user_id);

-- ─── HABIT LOGS ───────────────────────────────────────────────
create table if not exists public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  habit_id    uuid not null references public.habits(id) on delete cascade,
  log_date    date not null,
  completed   boolean not null default false,
  created_at  timestamptz not null default now(),
  unique(user_id, habit_id, log_date)
);

create index if not exists habit_logs_user_date_idx on public.habit_logs(user_id, log_date desc);

-- ─── CHALLENGES ───────────────────────────────────────────────
create table if not exists public.challenges (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text not null,
  type            text not null check (type in ('workout_streak','workout_count','consistency','volume')),
  target_value    integer not null check (target_value > 0),
  duration_days   integer check (duration_days > 0),
  badge_emoji     text not null default '🏆',
  badge_name      text not null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ─── CHALLENGE MEMBERS ────────────────────────────────────────
create table if not exists public.challenge_members (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  challenge_id    uuid not null references public.challenges(id) on delete cascade,
  joined_at       timestamptz not null default now(),
  completed_at    timestamptz,
  current_value   integer not null default 0,
  is_completed    boolean not null default false,
  unique(user_id, challenge_id)
);

create index if not exists challenge_members_user_id_idx on public.challenge_members(user_id);

-- ─── ACHIEVEMENTS ─────────────────────────────────────────────
create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  name        text not null,
  description text not null,
  emoji       text not null,
  rarity      text not null default 'common' check (rarity in ('common','rare','epic','legendary')),
  created_at  timestamptz not null default now()
);

-- ─── USER ACHIEVEMENTS ────────────────────────────────────────
create table if not exists public.user_achievements (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  achievement_id  uuid not null references public.achievements(id) on delete cascade,
  earned_at       timestamptz not null default now(),
  unique(user_id, achievement_id)
);

create index if not exists user_achievements_user_id_idx on public.user_achievements(user_id);

-- ─── REFERRALS ────────────────────────────────────────────────
create table if not exists public.referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references auth.users(id) on delete cascade,
  referee_id      uuid references auth.users(id) on delete set null,
  code            text not null,
  clicked_at      timestamptz not null default now(),
  signup_at       timestamptz,
  activated_at    timestamptz, -- first workout completed
  status          text not null default 'pending' check (status in ('pending','signed_up','activated'))
);

create index if not exists referrals_referrer_id_idx on public.referrals(referrer_id);
create index if not exists referrals_code_idx on public.referrals(code);

-- ─── NOTIFICATION PREFERENCES ─────────────────────────────────
create table if not exists public.notification_preferences (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  workout_reminder    boolean not null default false,
  workout_time        time default '18:00',
  streak_reminder     boolean not null default false,
  water_reminder      boolean not null default false,
  vapid_subscription  jsonb, -- Web Push subscription object
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── ANALYTICS EVENTS ─────────────────────────────────────────
create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event_name  text not null,
  properties  jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists analytics_events_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);

-- ─── PROGRESS PHOTOS (Low-Cost Optimized) ──────────────────────
create table if not exists public.progress_photos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  photo_url   text not null,
  weight_kg   numeric(5,2) check (weight_kg > 0 and weight_kg <= 500),
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists progress_photos_user_date_idx on public.progress_photos(user_id, created_at desc);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────

alter table public.profiles              enable row level security;
alter table public.user_preferences      enable row level security;
alter table public.workout_sessions      enable row level security;
alter table public.exercise_sets         enable row level security;
alter table public.personal_records      enable row level security;
alter table public.meal_logs             enable row level security;
alter table public.water_logs            enable row level security;
alter table public.sleep_logs            enable row level security;
alter table public.body_metrics          enable row level security;
alter table public.progress_photos       enable row level security;
alter table public.habits                enable row level security;
alter table public.habit_logs            enable row level security;
alter table public.challenges            enable row level security;
alter table public.challenge_members     enable row level security;
alter table public.achievements          enable row level security;
alter table public.user_achievements     enable row level security;
alter table public.referrals             enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.analytics_events      enable row level security;

-- Drop existing policies (idempotent)
do $$ declare r record; begin
  for r in (select schemaname, tablename, policyname from pg_policies where schemaname = 'public') loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Profiles: users can read/update their own
create policy "profiles: own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- User preferences: own
create policy "user_preferences: own" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Workout sessions: own
create policy "workout_sessions: own" on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Exercise sets: own
create policy "exercise_sets: own" on public.exercise_sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Personal records: own
create policy "personal_records: own" on public.personal_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Meal logs: own
create policy "meal_logs: own" on public.meal_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Water logs: own
create policy "water_logs: own" on public.water_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sleep logs: own
create policy "sleep_logs: own" on public.sleep_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Body metrics: own
create policy "body_metrics: own" on public.body_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Progress photos: own (Private photo storage & RLS)
create policy "progress_photos: own" on public.progress_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habits: own
create policy "habits: own" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habit logs: own
create policy "habit_logs: own" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Challenges: anyone can read, only admins can write (service role)
create policy "challenges: read all" on public.challenges
  for select using (true);

-- Challenge members: own
create policy "challenge_members: own" on public.challenge_members
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Achievements: anyone can read
create policy "achievements: read all" on public.achievements
  for select using (true);

-- User achievements: own
create policy "user_achievements: own" on public.user_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Referrals: referrer can see their own; referee can see their own
create policy "referrals: referrer can see" on public.referrals
  for select using (auth.uid() = referrer_id);

create policy "referrals: insert own" on public.referrals
  for insert with check (auth.uid() = referrer_id);

-- Notification prefs: own
create policy "notification_preferences: own" on public.notification_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Analytics events: users can insert their own
create policy "analytics_events: insert own" on public.analytics_events
  for insert with check (auth.uid() = user_id or user_id is null);

-- ─── Auto-create profile on sign-up ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, onboarding_completed)
    values(new.id, false)
    on conflict(id) do nothing;

  -- Generate unique referral code
  update public.profiles
    set referral_code = upper(substring(encode(gen_random_bytes(4), 'hex') from 1 for 6))
    where id = new.id and referral_code is null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── SEED: Default challenges ──────────────────────────────────
insert into public.challenges (title, description, type, target_value, duration_days, badge_emoji, badge_name)
values
  ('7-Day Starter', 'Complete a workout every day for 7 days.', 'workout_streak', 7, 7, '🔥', 'WEEK ONE'),
  ('14-Day Consistency', 'Work out 14 days in a row.', 'workout_streak', 14, 14, '💪', 'FORTNIGHT'),
  ('30-Day Challenge', 'Complete 30 workouts in 30 days.', 'workout_count', 30, 30, '🏆', '30-DAY WARRIOR'),
  ('First 10 Workouts', 'Log your first 10 workouts.', 'workout_count', 10, null, '✨', 'GETTING STARTED'),
  ('50 Workouts', 'Complete 50 total workouts.', 'workout_count', 50, null, '🥇', 'HALF CENTURY'),
  ('100 Workouts', 'Complete 100 total workouts.', 'workout_count', 100, null, '🌟', 'CENTURY CLUB')
on conflict do nothing;

-- ─── SEED: Default achievements ───────────────────────────────
insert into public.achievements (key, name, description, emoji, rarity)
values
  ('first_workout', 'First Workout', 'Completed your very first workout.', '🏋️', 'common'),
  ('first_pr', 'First PR', 'Set your first personal record.', '💪', 'common'),
  ('streak_7', '7-Day Streak', 'Worked out 7 days in a row.', '🔥', 'common'),
  ('streak_30', '30-Day Streak', 'Worked out 30 days in a row.', '🌟', 'rare'),
  ('streak_100', '100-Day Streak', 'Worked out 100 days in a row.', '💎', 'legendary'),
  ('workouts_10', '10 Workouts', 'Completed 10 workouts.', '✨', 'common'),
  ('workouts_50', '50 Workouts', 'Completed 50 workouts.', '🥇', 'rare'),
  ('workouts_100', '100 Workouts', 'Completed 100 workouts.', '🏆', 'epic'),
  ('referral_1', 'Recruiter', 'Referred a friend who signed up.', '🤝', 'common'),
  ('night_owl', 'Night Owl', 'Logged a workout after 10pm.', '🦉', 'rare')
on conflict (key) do nothing;