'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday } from 'date-fns'
import { saveProgressPhoto, getAllProgressPhotos, deleteProgressPhoto } from '@/lib/offline/photoStore'
import { compressImage, type CompressedImageResult } from '@/lib/media/imageCompressor'
import { soundFx } from '@/lib/audio/workoutAudio'
import { Button } from '@/components/ui/Button'
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Scale,
  Flame,
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react'
import type { ProgressPhotoEntry, BodyMetrics, PhotoPoseTag } from '@/types'

interface ProgressCalendarProps {
  weightLogs: BodyMetrics[]
  workoutDates: string[] // Array of YYYY-MM-DD strings
}

export function ProgressCalendar({ weightLogs, workoutDates }: ProgressCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [photos, setPhotos] = useState<ProgressPhotoEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // Modals state
  const [showDayModal, setShowDayModal] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  
  // Upload State
  const [uploading, setUploading] = useState(false)
  const [compressionStat, setCompressionStat] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPhotos()
  }, [])

  async function loadPhotos() {
    const data = await getAllProgressPhotos()
    setPhotos(data)
  }

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    })
  }, [currentMonth])

  // Get data specific to a date string YYYY-MM-DD
  function getDayData(dateStr: string) {
    const dayPhotos = photos.filter((p) => p.date === dateStr)
    const dayWeight = weightLogs.find((w) => w.created_at.startsWith(dateStr))
    const workedOut = workoutDates.includes(dateStr)
    return { dayPhotos, dayWeight, workedOut }
  }

  // --- Handlers ---
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setShowDayModal(true)
  }

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>, targetDate: Date) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result: CompressedImageResult = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.78,
      })

      const dateStr = format(targetDate, 'yyyy-MM-dd')
      const compKb = Math.round(result.compressedSize / 1024)
      
      const newPhoto: ProgressPhotoEntry = {
        id: crypto.randomUUID(),
        user_id: 'local',
        date: dateStr,
        url: result.dataUrl,
        pose: 'front', // Default
        compressed_size_kb: compKb,
        compression_ratio: result.compressionRatio,
        created_at: new Date().toISOString(),
      }

      await saveProgressPhoto(newPhoto)
      await loadPhotos()
      soundFx.playPRCelebration()
      
      setCompressionStat(`Saved ${compKb}KB (${result.compressionRatio}% smaller)`)
      setTimeout(() => setCompressionStat(null), 4000)
    } catch (err) {
      alert('Failed to compress and save image.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeletePhoto(id: string) {
    if (!confirm('Delete this progress photo?')) return
    await deleteProgressPhoto(id)
    await loadPhotos()
  }

  return (
    <div className="space-y-4">
      {/* ─── Calendar Header ─── */}
      <div className="card-lg bg-surface border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-text-main flex items-center gap-2">
              <Camera size={18} className="text-accent" /> Visual Progress Calendar
            </h2>
            <p className="text-[11px] text-muted">
              Tap any day to view or add physique photos & metrics
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowCompareModal(true)}
            className="text-xs font-bold gap-1.5"
            disabled={photos.length < 2}
          >
            <ArrowLeftRight size={14} /> Compare
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-surface-2 rounded-xl p-2 mb-3 border border-border">
          <button onClick={handlePrevMonth} className="p-1 text-muted hover:text-text-main transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="text-sm font-bold text-text-main tracking-wide uppercase">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <button onClick={handleNextMonth} className="p-1 text-muted hover:text-text-main transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-[10px] font-bold text-muted uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty offset days */}
          {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-lg bg-transparent" />
          ))}

          {/* Actual days */}
          {daysInMonth.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const { dayPhotos, dayWeight, workedOut } = getDayData(dateStr)
            const isTodayDate = isToday(day)
            const hasPhoto = dayPhotos.length > 0

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-start pt-1 overflow-hidden transition-all group hover:border-accent ${
                  isTodayDate ? 'border-accent/70 bg-accent/5' : 'border-border bg-surface-1'
                }`}
              >
                {/* Date Number */}
                <span className={`text-xs font-bold z-10 ${isTodayDate ? 'text-accent' : 'text-muted-foreground'}`}>
                  {format(day, 'd')}
                </span>

                {/* Badges Container */}
                <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-10">
                  {workedOut && (
                    <span className="w-3.5 h-3.5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-[9px] shadow-sm backdrop-blur-md border border-orange-500/30">
                      🔥
                    </span>
                  )}
                  {dayWeight && (
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] shadow-sm backdrop-blur-md border border-blue-500/30">
                      ⚖️
                    </span>
                  )}
                </div>

                {/* Photo Thumbnail Background */}
                {hasPhoto && (
                  <div className="absolute inset-0 z-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dayPhotos[0].url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                )}
                
                {hasPhoto && (
                  <div className="absolute bottom-1 right-1 z-10">
                    <span className="bg-[#b7ff3c] text-black text-[8px] font-black px-1 rounded-sm shadow">
                      {dayPhotos.length}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Day Details Modal ─── */}
      {showDayModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="card-lg bg-[#11161d] border border-[#242d38] max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {(() => {
              const dateStr = format(selectedDate, 'yyyy-MM-dd')
              const { dayPhotos, dayWeight, workedOut } = getDayData(dateStr)

              return (
                <>
                  <div className="flex items-center justify-between p-4 border-b border-border bg-surface-1">
                    <div>
                      <h3 className="text-base font-black text-text-main">
                        {format(selectedDate, 'MMMM d, yyyy')}
                      </h3>
                      <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                        {isToday(selectedDate) ? (
                          <span className="text-accent font-bold">Today</span>
                        ) : (
                          'Past Record'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDayModal(false)}
                      className="text-muted hover:text-text-main p-1 rounded-lg hover:bg-surface-2"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4 overflow-y-auto space-y-5 custom-scrollbar">
                    {/* Metrics / Workout Badges */}
                    <div className="flex items-center gap-3">
                      {workedOut ? (
                        <div className="flex-1 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                          <Flame size={16} className="text-orange-400 mx-auto mb-1" />
                          <div className="text-xs font-bold text-orange-400">Workout Done</div>
                        </div>
                      ) : (
                        <div className="flex-1 bg-surface-2 border border-border rounded-xl p-3 text-center opacity-50">
                          <div className="text-xs font-bold text-muted">Rest Day</div>
                        </div>
                      )}

                      {dayWeight ? (
                        <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                          <Scale size={16} className="text-blue-400 mx-auto mb-1" />
                          <div className="text-xs font-bold text-blue-400">{dayWeight.weight_kg} kg</div>
                        </div>
                      ) : (
                        <div className="flex-1 bg-surface-2 border border-border rounded-xl p-3 text-center opacity-50">
                          <div className="text-xs font-bold text-muted">No weigh-in</div>
                        </div>
                      )}
                    </div>

                    {/* Progress Photos Gallery */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-text-main uppercase tracking-wide">Physique Photos</h4>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoSelected(e, selectedDate)}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => fileInputRef.current?.click()}
                          loading={uploading}
                          className="text-xs text-accent hover:text-accent hover:bg-accent/10 h-7 px-2"
                        >
                          <Plus size={14} /> Add Photo
                        </Button>
                      </div>

                      {compressionStat && (
                        <div className="text-[10px] text-green-400 font-bold bg-green-400/10 border border-green-400/20 px-2 py-1 rounded-md flex items-center gap-1 animate-fade-in">
                          <Sparkles size={12} /> {compressionStat}
                        </div>
                      )}

                      {dayPhotos.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border rounded-2xl p-4 bg-surface-1/50">
                          <ImageIcon className="mx-auto mb-2 text-muted/50" size={24} />
                          <p className="font-medium text-text-main text-sm mb-1">No photos for this day</p>
                          <p className="text-[10px] text-muted">
                            Upload a 100% private, zero-bandwidth WebP compressed physique update.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {dayPhotos.map((photo) => (
                            <div key={photo.id} className="relative rounded-2xl overflow-hidden border border-border bg-black group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo.url} alt="Progress" className="w-full h-auto max-h-[60vh] object-contain" />
                              
                              {/* Overlay actions */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <div className="flex justify-between items-end">
                                  <div>
                                    <span className="text-[10px] bg-surface-2 text-text-main px-2 py-1 rounded border border-border uppercase font-bold tracking-wider">
                                      {photo.pose} pose
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-text-main transition-colors border border-red-500/30"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* ─── Before & After Compare Modal ─── */}
      {showCompareModal && photos.length >= 2 && (
        <BeforeAfterCompareModal
          photos={photos}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Before & After Compare Modal Sub-component
// ────────────────────────────────────────────────────────────────
function BeforeAfterCompareModal({ photos, onClose }: { photos: ProgressPhotoEntry[]; onClose: () => void }) {
  // Sort oldest to newest for comparison picker
  const sorted = [...photos].sort((a, b) => a.date.localeCompare(b.date))
  
  const [leftPhotoId, setLeftPhotoId] = useState(sorted[0].id)
  const [rightPhotoId, setRightPhotoId] = useState(sorted[sorted.length - 1].id)

  const leftPhoto = photos.find((p) => p.id === leftPhotoId)
  const rightPhoto = photos.find((p) => p.id === rightPhotoId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl h-full max-h-[90vh] flex flex-col bg-[#080b10] rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-1">
          <div>
            <h3 className="text-lg font-black text-text-main flex items-center gap-2">
              <ArrowLeftRight className="text-accent" /> Before & After Compare
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-muted hover:text-text-main">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 gap-4">
          {/* Left Side (Before) */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <select
              value={leftPhotoId}
              onChange={(e) => setLeftPhotoId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-text-main font-bold text-sm focus:outline-none focus:border-accent"
            >
              {sorted.map((p) => (
                <option key={`left-${p.id}`} value={p.id}>
                  {format(parseISO(p.date), 'MMM d, yyyy')} ({p.pose})
                </option>
              ))}
            </select>
            <div className="flex-1 rounded-2xl border border-border overflow-hidden relative bg-black flex items-center justify-center">
              {leftPhoto && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={leftPhoto.url} alt="Before" className="w-full h-full object-contain" />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-text-main text-xs font-bold px-3 py-1.5 rounded-lg border border-border">
                    BEFORE • {format(parseISO(leftPhoto.date), 'MMM d, yyyy')}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* VS Badge for desktop */}
          <div className="hidden md:flex flex-col items-center justify-center -mx-2 z-10">
            <div className="w-10 h-10 rounded-full bg-accent text-black font-black flex items-center justify-center border-4 border-[#080b10] shadow-xl">
              VS
            </div>
          </div>

          {/* Right Side (After) */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <select
              value={rightPhotoId}
              onChange={(e) => setRightPhotoId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-2 border border-border text-text-main font-bold text-sm focus:outline-none focus:border-accent"
            >
              {sorted.map((p) => (
                <option key={`right-${p.id}`} value={p.id}>
                  {format(parseISO(p.date), 'MMM d, yyyy')} ({p.pose})
                </option>
              ))}
            </select>
            <div className="flex-1 rounded-2xl border border-accent/40 overflow-hidden relative bg-black flex items-center justify-center">
              {rightPhoto && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rightPhoto.url} alt="After" className="w-full h-full object-contain" />
                  <div className="absolute top-3 right-3 bg-accent/20 backdrop-blur text-accent text-xs font-bold px-3 py-1.5 rounded-lg border border-accent/40">
                    AFTER • {format(parseISO(rightPhoto.date), 'MMM d, yyyy')}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
