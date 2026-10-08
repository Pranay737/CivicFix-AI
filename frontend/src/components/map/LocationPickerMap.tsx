import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number, addressText?: string) => void;
  className?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude = 37.7749,
  longitude = -122.4194,
  onChange,
  className = 'h-72',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: latitude,
    lng: longitude,
  });

  // Custom DivIcon with SVG Pin so Vite doesn't break marker image paths
  const customPinIcon = L.divIcon({
    className: 'custom-leaflet-pin',
    html: `<div style="transform: translate(-50%, -100%);">
      <svg width="34" height="42" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
      </svg>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng });
        onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCoords({ lat, lng });
        onChange(lat, lng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        // Fallback to current
      }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
      <div ref={mapContainerRef} className={`w-full ${className}`} />

      {/* Control overlay */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-2.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Use current GPS location"
        >
          <Navigation className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-rose-500" />
        <span>
          Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
};
