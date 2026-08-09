'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom glowing avatar icon using CSS classes
const glowingAvatarIcon = new L.DivIcon({
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute inset-0 bg-[#b7ff3c] rounded-full animate-ping opacity-75 blur-sm"></div>
      <div class="relative z-10 w-4 h-4 bg-[#b7ff3c] rounded-full shadow-[0_0_15px_#b7ff3c] border-2 border-[#080b10]"></div>
    </div>
  `,
  className: 'custom-avatar-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// A mock zigzag path representing a run
const zigzagPath: [number, number][] = [
  [40.7128, -74.0060], // Start (e.g. NYC)
  [40.7138, -74.0050],
  [40.7130, -74.0030],
  [40.7145, -74.0020],
  [40.7140, -73.9990],
  [40.7155, -73.9980],
  [40.7160, -73.9950],
  [40.7175, -73.9940],
]

// Component to handle auto-panning the map to follow the avatar
function MapAutoPan({ position }: { position: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true })
  }, [position, map])
  return null
}

export default function RunMap({ isDemoRunning }: { isDemoRunning: boolean }) {
  const [currentPosition, setCurrentPosition] = useState<[number, number]>(zigzagPath[0])
  const [path, setPath] = useState<[number, number][]>([zigzagPath[0]])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isDemoRunning) {
      let index = 0;
      intervalRef.current = setInterval(() => {
        index++;
        if (index >= zigzagPath.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return
        }
        const nextPos = zigzagPath[index]
        setCurrentPosition(nextPos)
        setPath(prev => [...prev, nextPos])
      }, 1500) // move every 1.5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      // Reset
      setCurrentPosition(zigzagPath[0])
      setPath([zigzagPath[0]])
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isDemoRunning])

  // Fix leaflet default icon issue when not using custom icons
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, [])

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-[#242d38] shadow-2xl relative z-0">
      <MapContainer 
        center={zigzagPath[0]} 
        zoom={16} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark mode map tiles
        />
        
        {/* Draw the glowing trail */}
        <Polyline 
          positions={path} 
          color="#b7ff3c" 
          weight={4} 
          opacity={0.8}
          className="animate-pulse" 
        />

        {/* The glowing avatar */}
        <Marker position={currentPosition} icon={glowingAvatarIcon} />
        
        {/* Auto pan map to follow the avatar */}
        <MapAutoPan position={currentPosition} />
      </MapContainer>
    </div>
  )
}
