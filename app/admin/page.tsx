'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Users, Activity, Settings, Database, RefreshCw, Sparkles, UserPlus } from 'lucide-react'
import Link from 'next/link'

type MockUser = {
  id: string
  email: string
  created_at: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<MockUser[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Fetch users (if RLS allows, or just mock them for display if not)
  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase.from('users').select('*').limit(10)
    if (error) {
      console.warn("Could not fetch real users (might need Admin privileges or table doesn't exist). Mocking data...")
      // Mock data for the presentation
      setUsers([
        { id: '1', email: 'john.doe@example.com', created_at: new Date().toISOString() },
        { id: '2', email: 'sarah.smith@fitness.co', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', email: 'mike_lifts@gmail.com', created_at: new Date(Date.now() - 172800000).toISOString() },
      ])
    } else if (data) {
      setUsers(data as any)
    }
    setLoading(false)
  }

  async function generateFakeUsers() {
    setGenerating(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newFakeUsers = Array.from({ length: 5 }).map((_, i) => ({
      id: Math.random().toString(36).substring(7),
      email: `fake_user_${Math.floor(Math.random() * 1000)}@test.com`,
      created_at: new Date().toISOString()
    }))

    setUsers(prev => [...newFakeUsers, ...prev])
    setGenerating(false)
  }

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--surface)] border-r border-[var(--border)] p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
            <span className="text-[var(--bg)] font-black text-xl">C</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin OS</h1>
            <p className="text-xs text-[var(--accent)]">Superuser Access</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 bg-[var(--accent)]/10 text-[var(--accent)] px-4 py-3 rounded-xl font-semibold transition-colors">
            <Users size={18} />
            Users
          </Link>
          <button className="flex items-center gap-3 text-muted hover:text-text-main hover:bg-[var(--border)] px-4 py-3 rounded-xl font-medium transition-colors text-left">
            <Activity size={18} />
            System Metrics
          </button>
          <button className="flex items-center gap-3 text-muted hover:text-text-main hover:bg-[var(--border)] px-4 py-3 rounded-xl font-medium transition-colors text-left">
            <Database size={18} />
            Database
          </button>
          <button className="flex items-center gap-3 text-muted hover:text-text-main hover:bg-[var(--border)] px-4 py-3 rounded-xl font-medium transition-colors text-left">
            <Settings size={18} />
            Settings
          </button>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-[var(--border)]">
          <Link href="/dashboard" className="text-sm text-muted hover:text-text-main transition-colors flex items-center gap-2">
            &larr; Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black">User Management</h2>
            <p className="text-muted mt-1">View and manage all registered users.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={fetchUsers} 
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button 
              onClick={generateFakeUsers}
              disabled={generating}
              className="gap-2 bg-gradient-to-r from-[var(--accent)] to-[#9ce020] text-[var(--bg)] shadow-lg shadow-[var(--accent)]/20"
            >
              {generating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Generate Fake Users
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted font-medium">Total Users</h3>
              <Users size={20} className="text-[var(--accent)]" />
            </div>
            <p className="text-4xl font-black">{users.length}</p>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-muted font-medium">Active Today</h3>
              <Activity size={20} className="text-green-400" />
            </div>
            <p className="text-4xl font-black">{Math.floor(users.length * 0.4)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a2332] to-[var(--bg)] border border-[var(--accent)]/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[var(--accent)]/10 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-muted font-medium text-[var(--accent)]">System Status</h3>
              <div className="w-3 h-3 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)] animate-pulse"></div>
            </div>
            <p className="text-xl font-bold relative z-10 text-white">All Systems Operational</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent Users</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg)] text-muted text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">User / Email</th>
                  <th className="px-6 py-4 font-medium">Created At</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-muted">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-muted">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#1a2332] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--border)] to-[var(--surface)] flex items-center justify-center font-bold text-sm">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-text-main">{user.email}</p>
                            <p className="text-xs text-muted font-mono mt-0.5">ID: {user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm text-[var(--accent)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
