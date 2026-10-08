import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, Priority } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ComplaintsOverviewMapProps {
  complaints: Complaint[];
  className?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#2563eb',
  LOW: '#64748b',
};

export const ComplaintsOverviewMap: React.FC<ComplaintsOverviewMapProps> = ({
  complaints,
  className = 'h-96',
  onSelectComplaint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 12,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when complaints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const validItems = complaints.filter(
      (c): c is Complaint & { latitude: number; longitude: number } =>
        typeof c.latitude === 'number' && typeof c.longitude === 'number'
    );

    if (validItems.length === 0) return;

    const bounds = L.latLngBounds([]);

    validItems.forEach((item) => {
      const color = PRIORITY_COLORS[item.priority] || '#2563eb';
      const icon = L.divIcon({
        className: 'custom-complaint-pin',
        html: `<div style="transform: translate(-50%, -100%);">
          <svg width="28" height="36" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
          </svg>
        </div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-xs';
      popupContent.innerHTML = `
        <div class="font-mono text-[10px] text-blue-600 font-bold mb-0.5">#${item.trackingNumber}</div>
        <div class="font-bold text-slate-800 text-sm mb-1">${item.title}</div>
        <div class="text-[11px] text-slate-500 mb-2 truncate max-w-xs">${item.address || 'No address specified'}</div>
        <div class="flex items-center gap-1.5 mb-2.5">
          <span style="background-color: ${color}20; color: ${color};" class="px-1.5 py-0.5 rounded font-bold text-[10px]">
            ${item.priority}
          </span>
          <span class="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
            ${item.status}
          </span>
        </div>
        <button id="view-btn-${item.id}" class="w-full py-1 text-center bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer">
          Inspect Details &rarr;
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-btn-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectComplaint) {
              onSelectComplaint(item);
            } else {
              // Navigate depending on current path or generic view
              navigate(`/complaints/${item.id}`);
            }
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.extend([item.latitude, item.longitude]);
    });

    if (validItems.length > 0 && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [complaints]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <div ref={mapContainerRef} className={`w-full ${className}`} />

      {/* Legend */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-1">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
          Issue Priority
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span className="text-slate-700 dark:text-slate-300">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-700 dark:text-slate-300">High</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="text-slate-700 dark:text-slate-300">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          <span className="text-slate-700 dark:text-slate-300">Low</span>
        </div>
      </div>
    </div>
  );
};
