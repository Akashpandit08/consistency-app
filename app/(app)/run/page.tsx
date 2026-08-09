'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/Button'
import { Play, Square, MapPin, Navigation, Zap } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Dynamically import the map to prevent SSR errors since Leaflet requires 'window'
const RunMap = dynamic(() => import('@/components/map/RunMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#111720] border border-[#242d38] rounded-2xl">
      <div className="animate-pulse flex flex-col items-center">
        <MapPin className="text-muted mb-2" size={32} />
        <p className="text-muted font-medium">Loading Map Data...</p>
      </div>
    </div>
  ),
})

export default function RunTrackingPage() {
  const [isRunning, setIsRunning] = useState(false)

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between border-b border-[#242d38] bg-[#080b10]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-[#111720] border border-[#242d38] flex items-center justify-center text-muted hover:text-text-main transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-black">Live Run Tracking</h1>
            <p className="text-xs text-muted flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              GPS Active
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* Left Side: Controls & Stats */}
        <div className="w-full md:w-80 flex flex-col gap-6">
          <div className="bg-[#111720] border border-[#242d38] rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Zap className="text-[#b7ff3c]" size={20} />
              Session Control
            </h2>
            
            <div className="flex flex-col gap-3">
              <Button 
                size="lg"
                className={`w-full font-bold text-lg h-14 ${isRunning ? 'bg-danger hover:bg-danger/80 text-white' : 'bg-gradient-to-r from-[#b7ff3c] to-[#9ce020] text-[#080b10] hover:scale-[1.02] transition-transform'}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <Square fill="currentColor" size={20} className="mr-2" />
                    Stop Demo Run
                  </>
                ) : (
                  <>
                    <Play fill="currentColor" size={20} className="mr-2" />
                    Start Demo Run
                  </>
                )}
              </Button>
              <p className="text-xs text-muted text-center mt-2">
                *Clicking start will simulate a zigzag run pattern across the map using the glowing avatar.
              </p>
            </div>
          </div>

          <div className="bg-[#111720] border border-[#242d38] rounded-2xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
             {/* Decorative background glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#b7ff3c]/5 rounded-full blur-3xl"></div>
             
             <div className="grid grid-cols-2 gap-4 relative z-10">
               <div>
                 <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-1">Pace</p>
                 <p className="text-2xl font-black">{isRunning ? '5:30' : '--:--'}<span className="text-sm font-medium text-muted ml-1">/km</span></p>
               </div>
               <div>
                 <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-1">Distance</p>
                 <p className="text-2xl font-black">{isRunning ? '1.2' : '0.0'}<span className="text-sm font-medium text-muted ml-1">km</span></p>
               </div>
               <div className="col-span-2 pt-4 border-t border-[#242d38]">
                 <p className="text-muted text-xs uppercase tracking-wider font-semibold mb-1">Time</p>
                 <p className="text-4xl font-black font-mono tracking-tight text-[#b7ff3c]">
                    {isRunning ? '08:45' : '00:00'}
                 </p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: The Map */}
        <div className="flex-1 h-[60vh] md:h-auto min-h-[400px] relative">
          {/* We wrap the map in a container that dictates its size */}
          <div className="absolute inset-0">
            <RunMap isDemoRunning={isRunning} />
          </div>
          
          {/* Floating Map Overlay */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-[#080b10]/90 backdrop-blur-md border border-[#242d38] rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl">
              <Navigation className="text-[#b7ff3c]" size={16} />
              <span className="text-sm font-medium">Tracking via GPS Simulator</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
