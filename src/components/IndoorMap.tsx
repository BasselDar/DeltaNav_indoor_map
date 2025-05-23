import React, { useState, useEffect, useRef } from 'react';

// Import floor-specific data
import { floors } from '../indoor/floors';
import { ROOM_NAMES, ROOM_DETAILS } from '../indoor/roomData';
import { getShortLabelParts, getShortDisplayName } from '../indoor/roomHelpers';
import { VertexData } from '../data/indoor/ground/graphData';
import { findShortestPath, calculatePathDistance } from '../indoor/pathFinder';
import {
  handleMouseMove,
  handleMouseDown,
  handleMouseUp,
  handleWheel,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleVertexMouseEnter,
  handleVertexMouseLeave,
  handleVertexClick
} from '../indoor/mapInteractions';
import {
  getFilteredLocations,
  handleLocationSelect,

} from '../indoor/sidebarInteractions';

// Add this right after the imports
const INFO_POINT_TYPES = {
  ROOM: 'room',
  RESTROOM_MALE: 'restroom_male',
  RESTROOM_FEMALE: 'restroom_female',
} as const;

// Add this helper function before the IndoorMap component
const getInfoPointType = (objectName: string | null) => {
  if (!objectName?.startsWith('info_')) return null;
  
  if (objectName === 'info_wc_male') return INFO_POINT_TYPES.RESTROOM_MALE;
  if (objectName === 'info_wc_female') return INFO_POINT_TYPES.RESTROOM_FEMALE;
  return INFO_POINT_TYPES.ROOM;
};

// Add icon SVGs for each room type at the top of the file (after imports)
const ROOM_TYPE_ICONS: Record<string, JSX.Element> = {
  dean: (
    <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#e0e7ff" />
      <path d="M12 17c2.5 0 4-1.5 4-4s-1.5-4-4-4-4 1.5-4 4 1.5 4 4 4z" fill="#3b82f6" />
      <circle cx="12" cy="11" r="2" fill="#1e40af" />
    </svg>
  ),
  staff: (
    <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#dcfce7" />
      <path d="M8 16c0-2 4-2 4 0" stroke="#22c55e" strokeWidth={2} />
      <circle cx="10" cy="10" r="2" fill="#16a34a" />
      <circle cx="14" cy="10" r="2" fill="#16a34a" />
    </svg>
  ),
  lab: (
    <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="6" y="10" width="12" height="8" rx="3" fill="#ede9fe" />
      <rect x="9" y="6" width="6" height="8" rx="2" fill="#a78bfa" />
      <circle cx="12" cy="14" r="2" fill="#7c3aed" />
    </svg>
  ),
  library: (
    <svg className="w-8 h-8 text-yellow-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="4" y="6" width="16" height="12" rx="2" fill="#fef9c3" />
      <rect x="7" y="9" width="10" height="6" rx="1" fill="#fde047" />
      <rect x="10" y="12" width="4" height="2" rx="0.5" fill="#facc15" />
    </svg>
  ),
  control: (
    <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="6" y="10" width="12" height="8" rx="3" fill="#e5e7eb" />
      <rect x="9" y="6" width="6" height="8" rx="2" fill="#9ca3af" />
      <circle cx="12" cy="14" r="2" fill="#374151" />
    </svg>
  ),
  hall: (
    <svg className="w-8 h-8 text-pink-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="5" y="8" width="14" height="8" rx="4" fill="#fce7f3" />
      <rect x="8" y="11" width="8" height="3" rx="1.5" fill="#f472b6" />
      <circle cx="12" cy="13" r="2" fill="#be185d" />
    </svg>
  ),
  secretary: (
    <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="6" y="10" width="12" height="8" rx="3" fill="#ffedd5" />
      <rect x="9" y="6" width="6" height="8" rx="2" fill="#fdba74" />
      <circle cx="12" cy="14" r="2" fill="#ea580c" />
    </svg>
  ),
  ta: (
    <svg className="w-8 h-8 text-cyan-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="6" y="10" width="12" height="8" rx="3" fill="#cffafe" />
      <rect x="9" y="6" width="6" height="8" rx="2" fill="#22d3ee" />
      <circle cx="12" cy="14" r="2" fill="#0e7490" />
    </svg>
  ),
  default: (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#f3f4f6" />
      <circle cx="12" cy="12" r="4" fill="#9ca3af" />
    </svg>
  )
};

// Helper to get icon type from room name
function getRoomTypeIcon(objectName: string | null): JSX.Element {
  if (!objectName) return ROOM_TYPE_ICONS.default;
  const name = (ROOM_NAMES[objectName.replace('info_', '')] || objectName).toLowerCase();
  if (name.includes('dean')) return ROOM_TYPE_ICONS.dean;
  if (name.includes('staff')) return ROOM_TYPE_ICONS.staff;
  if (name.includes('lab')) return ROOM_TYPE_ICONS.lab;
  if (name.includes('library')) return ROOM_TYPE_ICONS.library;
  if (name.includes('control')) return ROOM_TYPE_ICONS.control;
  if (name.includes('hall')) return ROOM_TYPE_ICONS.hall;
  if (name.includes('secretary')) return ROOM_TYPE_ICONS.secretary;
  if (name.includes('teaching assistant') || name.includes('ta')) return ROOM_TYPE_ICONS.ta;
  return ROOM_TYPE_ICONS.default;
}

const IndoorMap: React.FC = () => {
  const [startSearchQuery, setStartSearchQuery] = useState('');
  const [endSearchQuery, setEndSearchQuery] = useState('');
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [path, setPath] = useState<VertexData[]>([]);
  const [distance, setDistance] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState<'search' | 'route' | 'floor' | null>('route');
  const [hoveredVertex, setHoveredVertex] = useState<string | null>(null);
  const [currentFloorIndex, setCurrentFloorIndex] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState<number>(0);
  const [offsetX] = useState(10);
  const [offsetY] = useState(60);
  const [scale] = useState(0.71);
  const [selectedLocation, setSelectedLocation] = useState<VertexData | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Tooltip delay state
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  // Add a new state to track the actual routing vertex id for the selected location
  const [selectedRoutingId, setSelectedRoutingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add zoom constants
  const minZoom = 1;
  const maxZoom = 2.5;

  // Get current floor data with adjusted coordinates
  const currentFloor = floors[currentFloorIndex];
  const currentGraphData = {
    ...currentFloor.graphData,
    vertices: currentFloor.graphData.vertices.map(vertex => ({
      ...vertex,
      cx: currentFloorIndex === 1 ? vertex.cx * scale + offsetX : vertex.cx,
      cy: currentFloorIndex === 1 ? vertex.cy * scale + offsetY : vertex.cy
    }))
  };

  // Update SVG viewBox to match the coordinate system
  const svgViewBox = {
    x: 0,
    y: 0,
    width: 1461.95,
    height: 1149.136
  };

  // Update clearRoute to be simpler
  const clearRoute = () => {
    setPath([]);
    setDistance(0);
    setSelectionMode(null);
    setSelectedStart(null);
    setSelectedEnd(null);
    setSelectedLocation(null);
    setSelectedRoutingId(null);
    setHoveredVertex(null);
    setTooltip(null);
    setShowTooltip(false);
    setErrorMessage(null);
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
  };

  // Update the path calculation effect to be more strict
  useEffect(() => {
    // Only calculate path if we have both start and end points
    // AND we're not in selection mode
    // AND we're not clearing the route
    if (selectedStart && selectedEnd && !selectionMode) {
      // Check if we actually need to calculate a new path
      const currentPath = path;
      if (currentPath.length === 0 || 
          currentPath[0].id !== selectedStart || 
          currentPath[currentPath.length - 1].id !== selectedEnd) {
        const newPath = findShortestPath(selectedStart, selectedEnd, currentGraphData);
        setPath(newPath);
      }
    }
  }, [selectedStart, selectedEnd, selectionMode, currentGraphData]);

  // Calculate total distance when path changes
  useEffect(() => {
    if (path.length > 1) {
      setDistance(calculatePathDistance(path));
    } else {
      setDistance(0);
    }
  }, [path]);

  // Update path length when path changes
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [path]);

  // Clear route when changing floors
  useEffect(() => {
    clearRoute();
  }, [currentFloorIndex]);

  // Update the detail box handlers to properly handle selection mode
  const handleMakeStart = (locationId: string | null) => {
    if (locationId) {
      if (locationId === selectedEnd) {
        setErrorMessage("Cannot select the same point as both start and end");
        setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
        return;
      }
      setSelectedStart(locationId);
      setSelectionMode('end');
      if (selectedEnd) {
        const newPath = findShortestPath(locationId, selectedEnd, currentGraphData);
        setPath(newPath);
      }
    }
  };

  const handleMakeEnd = (locationId: string | null) => {
    if (locationId) {
      if (locationId === selectedStart) {
        setErrorMessage("Cannot select the same point as both start and end");
        setTimeout(() => setErrorMessage(null), 3000); // Clear error after 3 seconds
        return;
      }
      setSelectedEnd(locationId);
      setSelectionMode(null);
      if (selectedStart) {
        const newPath = findShortestPath(selectedStart, locationId, currentGraphData);
        setPath(newPath);
      }
    }
  };

  return (
    <div ref={mapContainerRef} className="fixed inset-0 w-full h-screen bg-gray-50">
      {/* Sidebar Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}
      {/* Sidebar - responsive overlay on small screens */}
      <div 
        className={`fixed md:static top-0 left-0 bottom-0 z-50 bg-[#1a1f2d] transition-all duration-500 ease-in-out shadow-xl
          ${isSidebarOpen ? 'w-[90vw] max-w-xs md:w-[280px]' : 'w-0 md:w-[60px]'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ height: '100vh' }}
      >
        {/* Always-visible close button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white bg-gray-900/80 rounded-full p-2 shadow-lg"
          aria-label="Close sidebar"
          style={{ display: isSidebarOpen ? 'block' : 'none' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {isSidebarOpen ? (
          <div className="h-full flex flex-col text-gray-300">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/80 to-gray-800/30">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                  Indoor Navigation
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-400 hover:text-white transform hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-transparent">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setExpandedSection('route')}
                  className={`px-2 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    expandedSection === 'route'
                      ? 'bg-blue-500/20 text-blue-400 scale-105'
                      : 'hover:bg-blue-500/10 text-gray-400 hover:text-blue-400'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-sm">Route</span>
                </button>
                <button
                  onClick={() => setExpandedSection('floor')}
                  className={`px-2 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    expandedSection === 'floor'
                      ? 'bg-blue-500/20 text-blue-400 scale-105'
                      : 'hover:bg-blue-500/10 text-gray-400 hover:text-blue-400'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm">Floor</span>
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Floor Section */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  expandedSection === 'floor' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 space-y-4">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-gray-400">Select Floor</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {floors.map((floor, index) => (
                        <button
                          key={floor.id}
                          onClick={() => setCurrentFloorIndex(index)}
                          className={`relative p-4 rounded-xl border transition-all duration-300 group overflow-hidden
                            ${currentFloorIndex === index
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                              : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-gray-900/50">
                              <span className="text-lg font-bold">{floor.shortName}</span>
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium">{floor.name}</div>
                              <div className="text-xs opacity-75">{floor.description}</div>
                            </div>
                            {currentFloorIndex === index && (
                              <div className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                Current
                              </div>
                            )}
                          </div>
                          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 transform transition-transform duration-1000 ${
                            currentFloorIndex === index ? 'translate-x-0' : 'translate-x-[-100%]'
                          }`}></div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <span className="text-xl font-bold text-blue-400">{currentFloor.shortName}</span>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Current Level</div>
                          <div className="text-base font-medium text-blue-400">
                            {currentFloor.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Section */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  expandedSection === 'route' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-4 space-y-4">
                  {/* Start Point Search */}
                  <div className="p-3 bg-gray-800/80 rounded-lg border border-gray-700 transition-all duration-300 hover:border-blue-500/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400 font-medium">Starting Point</span>
                      {selectedStart && (
                        <button
                          onClick={() => {
                            setSelectedStart(null);
                            setPath([]);
                          }}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {selectedStart ? (
                      <div 
                        className="flex items-center gap-2 text-green-400 cursor-pointer hover:bg-green-500/10 p-2 rounded transition-all duration-300"
                        onMouseEnter={() => handleVertexMouseEnter(selectedStart, setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer, currentGraphData)}
                        onMouseLeave={() => handleVertexMouseLeave(setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span className="font-medium">
                          {getShortDisplayName(currentGraphData.vertices.find(v => v.id === selectedStart)?.objectName || null)}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Search starting point..."
                              className="w-full h-11 px-4 pl-10 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 
                                       focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300
                                       text-base"
                              value={startSearchQuery}
                              onChange={(e) => setStartSearchQuery(e.target.value)}
                            />
                            <svg 
                              className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <button
                            onClick={() => {
                              if (selectionMode === 'start') {
                                setSelectionMode(null);
                              } else {
                                setSelectionMode('start');
                                setStartSearchQuery('');
                              }
                            }}
                            className={`h-11 px-3 rounded-xl bg-gray-700/50 text-gray-300 
                                     transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 border
                                     ${selectionMode === 'start' 
                                       ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                       : 'border-gray-600 hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30'
                                     }`}
                            title="Click on map to select start point"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" />
                            </svg>
                            <span className="text-sm">Map</span>
                          </button>
                        </div>
                        
                        {startSearchQuery && (
                          <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50 divide-y divide-gray-700/50">
                            {getFilteredLocations(startSearchQuery, currentGraphData).map(location => (
                              <div
                                key={location.id}
                                className="flex items-center justify-between p-3 hover:bg-green-500/10 cursor-pointer transition-all duration-300 first:rounded-t-lg last:rounded-b-lg"
                                onClick={() => handleLocationSelect(
                                  location,
                                  selectionMode,
                                  setSelectedStart,
                                  setSelectedEnd,
                                  setSelectionMode,
                                  setStartSearchQuery,
                                  setEndSearchQuery,
                                  selectedStart,
                                  selectedEnd,
                                  findShortestPath,
                                  setPath,
                                  currentGraphData
                                )}
                                onMouseEnter={() => handleVertexMouseEnter(location, setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer, currentGraphData)}
                                onMouseLeave={() => handleVertexMouseLeave(setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer)}
                              >
                                <div className="flex flex-col">
                                  <span className="text-green-400 font-medium">
                                    {getShortDisplayName(location.objectName)}
                                  </span>
                                  {location.objectName?.startsWith('info_') && !['info_wc_male', 'info_wc_female'].includes(location.objectName || '') && (
                                    <span className="text-gray-400 text-xs">
                                      Room {location.objectName?.replace('info_', '').replace('wc_', '') || ''}
                                    </span>
                                  )}
                                </div>
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* End Point Search */}
                  <div className="p-3 bg-gray-800/80 rounded-lg border border-gray-700 transition-all duration-300 hover:border-blue-500/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400 font-medium">Destination</span>
                      {selectedEnd && (
                        <button
                          onClick={() => {
                            setSelectedEnd(null);
                            setPath([]);
                          }}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {selectedEnd ? (
                      <div 
                        className="flex items-center gap-2 text-red-400 cursor-pointer hover:bg-red-500/10 p-2 rounded transition-all duration-300"
                        onMouseEnter={() => handleVertexMouseEnter(selectedEnd, setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer, currentGraphData)}
                        onMouseLeave={() => handleVertexMouseLeave(setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="font-medium">
                          {getShortDisplayName(currentGraphData.vertices.find(v => v.id === selectedEnd)?.objectName || null)}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Search destination..."
                              className="w-full h-11 px-4 pl-10 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 
                                       focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300
                                       text-base"
                              value={endSearchQuery}
                              onChange={(e) => setEndSearchQuery(e.target.value)}
                            />
                            <svg 
                              className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <button
                            onClick={() => {
                              if (selectionMode === 'end') {
                                setSelectionMode(null);
                              } else {
                                setSelectionMode('end');
                                setEndSearchQuery('');
                              }
                            }}
                            className={`h-11 px-3 rounded-xl bg-gray-700/50 text-gray-300 
                                     transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 border
                                     ${selectionMode === 'end' 
                                       ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                                       : 'border-gray-600 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                                     }`}
                            title="Click on map to select destination"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" />
                            </svg>
                            <span className="text-sm">Map</span>
                          </button>
                        </div>
                        
                        {endSearchQuery && (
                          <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50 divide-y divide-gray-700/50">
                            {getFilteredLocations(endSearchQuery, currentGraphData).map(location => (
                              <div
                                key={location.id}
                                className="flex items-center justify-between p-3 hover:bg-red-500/10 cursor-pointer transition-all duration-300 first:rounded-t-lg last:rounded-b-lg"
                                onClick={() => handleLocationSelect(
                                  location,
                                  selectionMode,
                                  setSelectedStart,
                                  setSelectedEnd,
                                  setSelectionMode,
                                  setStartSearchQuery,
                                  setEndSearchQuery,
                                  selectedStart,
                                  selectedEnd,
                                  findShortestPath,
                                  setPath,
                                  currentGraphData
                                )}
                                onMouseEnter={() => handleVertexMouseEnter(location, setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer, currentGraphData)}
                                onMouseLeave={() => handleVertexMouseLeave(setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer)}
                              >
                                <div className="flex flex-col">
                                  <span className="text-red-400 font-medium">
                                    {getShortDisplayName(location.objectName)}
                                  </span>
                                  {location.objectName?.startsWith('info_') && !['info_wc_male', 'info_wc_female'].includes(location.objectName || '') && (
                                    <span className="text-gray-400 text-xs">
                                      Room {location.objectName?.replace('info_', '').replace('wc_', '') || ''}
                                    </span>
                                  )}
                                </div>
                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Route Information */}
                  {path.length > 1 && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Distance Information */}
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 backdrop-blur-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Total Distance</span>
                          <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                            {distance.toFixed(0)} units
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Walking Time</span>
                          <span className="text-blue-400">
                            ~{Math.ceil(distance / 100)} minutes
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Stops</span>
                          <span className="text-blue-400">
                            {path.length} locations
                          </span>
                        </div>
                      </div>

                      {/* Clear Route Button */}
                      <button
                        onClick={clearRoute}
                        className="w-full group bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 p-3 rounded-lg
                                 border border-gray-700 hover:border-red-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <svg 
                          className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span className="font-medium">Clear Route</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Sidebar */
          <div className="flex flex-col items-center py-4 space-y-4">
            <button 
              onClick={() => {
                setIsSidebarOpen(true);
                setExpandedSection('search');
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 
                       rounded-lg transition-all duration-300 group"
              title="Search"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button 
              onClick={() => {
                setIsSidebarOpen(true);
                setExpandedSection('route');
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 
                       rounded-lg transition-all duration-300 group"
              title="Navigation"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>

            <button 
              onClick={() => {
                setIsSidebarOpen(true);
                setExpandedSection('floor');
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 
                       rounded-lg transition-all duration-300 group"
              title="Floor"
            >
              <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Floating open button (FAB) when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-[100] bg-blue-600 text-white p-4 rounded-full shadow-lg md:hidden hover:bg-blue-700 transition-all"
          aria-label="Open sidebar"
          style={{ pointerEvents: 'auto' }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Map View - responsive padding for sidebar */}
      <div 
        className={`absolute transition-all duration-500 ease-in-out bg-white
          ${isSidebarOpen ? 'left-0 md:left-[280px]' : 'left-0 md:left-[60px]'}
          right-0 top-0 bottom-0 ${selectionMode ? 'cursor-crosshair' : ''}`}
        style={{ height: '100vh', minHeight: 0 }}
      >
        <svg
          ref={svgRef}
          viewBox={`${svgViewBox.x} ${svgViewBox.y} ${svgViewBox.width} ${svgViewBox.height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={e => handleMouseMove(e, svgRef, setHoveredVertex, isPanning, panStart, setPan)}
          onMouseDown={e => handleMouseDown(e, setIsPanning, setPanStart, pan)}
          onMouseUp={() => handleMouseUp(setIsPanning, setPanStart)}
          onMouseLeave={() => handleMouseUp(setIsPanning, setPanStart)}
          onWheel={e => handleWheel(e, zoom, setZoom, minZoom, maxZoom)}
          onTouchStart={e => handleTouchStart(e, setIsPanning, setPanStart, pan)}
          onTouchMove={e => handleTouchMove(e, isPanning, panStart, setPan)}
          onTouchEnd={() => handleTouchEnd(setIsPanning, setPanStart)}
          style={{ cursor: isPanning ? 'grabbing' : selectionMode ? 'crosshair' : 'grab', userSelect: 'none' }}
        >
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,255,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>

          {/* Background grid for reference */}
          <rect width={svgViewBox.width} height={svgViewBox.height} fill="url(#grid)" opacity="0.3" />

          {/* Background Map */}
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          <image
            href={currentFloor.svgPath}
            x="0"
            y="0"
            width={svgViewBox.width}
            height={svgViewBox.height}
            className="transition-opacity duration-300"
            style={{ opacity: expandedSection === 'floor' ? 0.5 : 1 }}
            preserveAspectRatio="xMidYMid meet"
          />
          
            {/* --- START: Apply zoom/pan to all interactive content --- */}
          {/* Floor Level Indicator on Map */}
          <g className="pointer-events-none">
            <rect
              x="20"
              y="20"
              width="120"
              height="48"
              rx="8"
                className={`transition-all duration-500 ${expandedSection === 'floor' ? 'opacity-0' : 'opacity-100'}`}
              fill="rgba(30, 41, 59, 0.9)"
              filter="url(#shadow)"
            >
              <animate
                attributeName="opacity"
                values="0.9;0.7;0.9"
                dur="3s"
                repeatCount="indefinite"
              />
            </rect>
              <g className={`transition-transform duration-500 ${expandedSection === 'floor' ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'}`}> 
                <text x="40" y="45" className="text-sm font-medium" fill="#94a3b8">Level</text>
                <text x="40" y="58" className="text-base font-semibold" fill="#60a5fa">{currentFloor.name}</text>
            </g>
          </g>

            {/* Filters, styles, and symbols (unchanged) */}
          <defs>
              {/* Room Info Icon */}
              <symbol id="info-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                <path d="M12 10v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </symbol>

              {/* Dean's Office Icon */}
              <image id="dean-office-icon" href="src/assets/indoor/dean_office.ico" width="32" height="32" />

              {/* Student Classroom Icon */}
              <image id="student-classroom-icon" href="src/assets/indoor/students_classroom.ico" width="52" height="52" />

              {/* PC Lab Icon */}
              <image id="pc-lab-icon" href="src/assets/indoor/pc_lab.ico" width="32" height="32" />

              {/* Hall Icon */}
              <symbol id="hall-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                <path d="M8 8h8v8H8z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </symbol>

              {/* Restroom Icons */}
              <symbol id="male-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                <path d="M12 13L12 21M12 11a4 4 0 100-8 4 4 0 000 8zM8 17l4-4M16 17l-4-4" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </symbol>

              <symbol id="female-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                <circle cx="12" cy="9" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 13v8M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </symbol>
          </defs>

          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(31, 41, 55, 0.5);
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(59, 130, 246, 0.7);
                border-radius: 4px;
                border: 2px solid rgba(31, 41, 55, 0.5);
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(59, 130, 246, 0.9);
              }
              @keyframes fade-in {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes drawPath {
                0% {
                  stroke-dashoffset: ${pathLength};
                  opacity: 0.4;
                }
                20% {
                  opacity: 1;
                }
                100% {
                  stroke-dashoffset: 0;
                  opacity: 1;
                }
              }
              .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
              }
              .path-element {
                transition: all 0.3s ease-out;
              }
              .path-element.fade-out {
                opacity: 0;
                transform: scale(0.95);
              }
              /* Add global text styles */
              text {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                font-weight: 500;
                letter-spacing: 0.01em;
              }
            `}
          </style>

          {/* Draw vertices with enhanced details */}
          {currentGraphData.vertices.map(vertex => {
            const isHovered = hoveredVertex === vertex.id;
            const isStart = vertex.id === selectedStart;
            const isEnd = vertex.id === selectedEnd;
            const isSelectable = vertex.objectName && (
              (selectionMode === 'start' && !isEnd) ||
              (selectionMode === 'end' && !isStart)
            );
            const infoPointType = getInfoPointType(vertex.objectName);

            return (
              <g 
                key={vertex.id}
                onMouseEnter={() => handleVertexMouseEnter(vertex, setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer, currentGraphData)}
                onMouseLeave={() => handleVertexMouseLeave(setHoveredVertex, setTooltip, setShowTooltip, tooltipTimer)}
                onClick={() => handleVertexClick(
                  vertex,
                  selectionMode,
                  setSelectedStart,
                  setSelectedEnd,
                  setSelectionMode,
                  selectedStart,
                  selectedEnd,
                  findShortestPath,
                  setPath,
                  currentGraphData,
                  setSelectedLocation,
                  setSelectedRoutingId
                )}
                style={{ cursor: 'pointer' }}
                className={path.length > 1 && !isStart && !isEnd ? 'opacity-30' : ''}
              >
                    {/* Selection indicator */}
                  {(isSelectable && isHovered) && (
                      <circle
                        cx={vertex.cx}
                        cy={vertex.cy}
                      r="20"
                      fill={selectionMode === 'start' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
                        filter="url(#glow)"
                      />
                    )}
                  {/* Animate start/end point */}
                  {(isStart || isEnd) && (
                    <circle
                      cx={vertex.cx}
                      cy={vertex.cy}
                      r={isHovered ? 16 : 12}
                      fill={isStart ? '#22c55e' : '#ef4444'}
                      stroke="#fff"
                      strokeWidth="3"
                      filter="url(#glow)"
                      className="transition-all duration-200"
                    />
                  )}
                  {/* Transparent clickable area for navigation */}
                  {vertex.objectName && !infoPointType && isNaN(Number(vertex.objectName)) && (
                    <circle
                      cx={vertex.cx}
                      cy={vertex.cy}
                      r={isHovered ? 14 : 10}
                      fill="transparent"
                      stroke={isHovered ? '#3b82f6' : 'transparent'}
                      strokeWidth={isHovered ? 3 : 0}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => handleVertexClick(
                        vertex,
                        selectionMode,
                        setSelectedStart,
                        setSelectedEnd,
                        setSelectionMode,
                        selectedStart,
                        selectedEnd,
                        findShortestPath,
                        setPath,
                        currentGraphData,
                        setSelectedLocation,
                        setSelectedRoutingId
                      )}
                      filter={isHovered ? 'url(#glow)' : undefined}
                    />
                  )}
                  {/* Regular vertex rendering (only if not an info point) */}
                  {vertex.objectName && !infoPointType && isNaN(Number(vertex.objectName)) && (
                      <text
                      x={vertex.cx}
                      y={vertex.cy + 38}
                        textAnchor="middle"
                      className="pointer-events-none"
                      fill="#64748b"
                        style={{
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        fontSize: '11px',
                        fontWeight: '500',
                        opacity: 0.7,
                          textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)'
                        }}
                      >
                      <tspan x={vertex.cx} dy="0">{getShortLabelParts(vertex.objectName)[0]}</tspan>
                      <tspan x={vertex.cx} dy="16"></tspan>
                      <tspan x={vertex.cx} dy="16">{getShortLabelParts(vertex.objectName)[1]}</tspan>
                      </text>
                )}

                {/* Info Point Icons with Room Numbers */}
                {infoPointType && (
                  <g 
                      onClick={() => handleVertexClick(
                        vertex,
                        selectionMode,
                        setSelectedStart,
                        setSelectedEnd,
                        setSelectionMode,
                        selectedStart,
                        selectedEnd,
                        findShortestPath,
                        setPath,
                        currentGraphData,
                        setSelectedLocation,
                        setSelectedRoutingId
                      )}
                    className={`cursor-pointer ${isSelectable ? 'hover:opacity-80' : ''}`}
                  >
                      {(() => {
                        const num = vertex.objectName?.replace('info_', '') || '';
                        if (vertex.objectName === 'info_435' || vertex.objectName === 'info_438') {
                          return (
                      <g transform={`translate(${vertex.cx}, ${vertex.cy})`}>
                        <text
                          x="0"
                                y="-20"
                          textAnchor="middle"
                                className="text-2xl font-bold"
                                fill="#64748b"
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                            textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)',
                                  fontSize: '24px',
                            fontWeight: '700'
                          }}
                        >
                                Hall {vertex.objectName === 'info_435' ? '7' : '8'}
                        </text>
                        <use
                                href="#student-classroom-icon"
                                width="52"
                                height="52"
                                className={`${isHovered ? 'scale-110' : ''} transition-all duration-200`}
                                transform="translate(-26, 6)"
                              />
                            </g>
                          );
                        }
                        // WC icons
                        if (vertex.objectName === 'info_wc_male' || vertex.objectName === 'info_wc_female') {
                          return (
                          <g transform={`translate(${vertex.cx}, ${vertex.cy})`}>
                            <text
                              x="0"
                              y="-15"
                              textAnchor="middle"
                              className="text-xl font-bold"
                                fill={vertex.objectName === 'info_wc_male' ? '#3b82f6' : '#ec4899'}
                              style={{
                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                                textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)',
                                fontSize: '20px',
                                fontWeight: '700'
                              }}
                            >
                                {vertex.objectName === 'info_wc_male' ? "Men's WC" : "Women's WC"}
                            </text>
                              <use
                                href={`#${vertex.objectName === 'info_wc_male' ? 'male-icon' : 'female-icon'}`}
                                width="32"
                                height="32"
                                className={
                                  `${isHovered ? 'scale-110' : ''} transition-all duration-200 ` +
                                  (vertex.objectName === 'info_wc_male' ? 'text-blue-600' : 'text-pink-600')
                                }
                                transform="translate(-16, 6)"
                              />
                            </g>
                          );
                        }
                        // Lab icon (already handled)
                        const roomName = ROOM_NAMES[num] || '';
                        if (/lab/i.test(roomName)) {
                          return (
                            <g transform={`translate(${vertex.cx}, ${vertex.cy})`}>
                            <use
                              href="#pc-lab-icon"
                              width="32"
                              height="32"
                              className={`${isHovered ? 'scale-110' : ''} transition-all duration-200`}
                              transform="translate(-16, 6)"
                            />
                          </g>
                          );
                        }
                        // ...existing code for other types...
                        return null;
                      })()}
                      {(() => {
                        const num = vertex.objectName?.replace('info_', '') || '';
                        // Dean and Head icons
                        if (
                          vertex.objectName === 'info_401' || vertex.objectName === 'info_402' || vertex.objectName === 'info_403' ||
                          /head/i.test(ROOM_NAMES[num] || '')
                        ) {
                          return (
                          <g transform={`translate(${vertex.cx}, ${vertex.cy})`}>
                            <text
                              x="0"
                              y="-15"
                              textAnchor="middle"
                              className="text-xl font-bold"
                                fill="#2563eb"
                              style={{
                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                                textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)',
                                  fontSize: '18px',
                                fontWeight: '700'
                              }}
                            >
                                {ROOM_NAMES[num]}
                            </text>
                            <use
                              href="#dean-office-icon"
                              width="32"
                              height="32"
                              className={`${isHovered ? 'scale-110' : ''} transition-all duration-200`}
                              transform="translate(-16, 6)"
                            />
                          </g>
                          );
                        }
                        // Hide label for WC and Hall icons
                        if (["info_wc_male", "info_wc_female", "info_435", "info_438"].includes(vertex.objectName || "")) return null;
                        const [labelName, labelNum] = getShortLabelParts(vertex.objectName);
                        return (
                            <text
                              x={vertex.cx}
                              y={vertex.cy - 15}
                              textAnchor="middle"
                              className="text-xl font-bold"
                              fill="#1e293b"
                              style={{
                                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                                textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8)',
                              fontSize: '18px',
                                fontWeight: '700'
                              }}
                            >
                            <tspan x={vertex.cx} dy="0">{labelName}</tspan>
                            <tspan x={vertex.cx} dy="20"></tspan>
                            <tspan x={vertex.cx} dy="20">{labelNum}</tspan>
                            </text>
                        );
                      })()}
                            <use
                              href="#info-icon"
                              width="32"
                              height="32"
                              className={`${isHovered ? 'text-blue-500 scale-110' : 'text-gray-600'} transition-all duration-200`}
                              transform={`translate(${vertex.cx - 16}, ${vertex.cy + 6})`}
                            />
                  </g>
                )}
              </g>
            );
          })}

          {/* Draw navigation path */}
          {path.length > 1 && (
            <>
              <defs>
                <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>

              {/* Path with enhanced shadow */}
              <path
                d={`M ${path.map(p => `${p.cx},${p.cy}`).join(' L ')}`}
                stroke="#3b82f6"
                strokeWidth="12"
                strokeOpacity="0.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {/* Main animated path - thicker */}
              <path
                ref={pathRef}
                className="main-path"
                d={`M ${path.map(p => `${p.cx},${p.cy}`).join(' L ')}`}
                stroke="url(#path-gradient)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: pathLength,
                  strokeDashoffset: pathLength,
                  animation: 'drawPath 1.5s ease-out forwards',
                  filter: 'url(#glow)'
                }}
              />

              {/* Larger waypoints */}
              {path.map((point, index) => (
                <circle
                  key={`waypoint-${index}`}
                  cx={point.cx}
                  cy={point.cy}
                  r="8"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity={index === 0 || index === path.length - 1 ? 1 : 0.7}
                  filter="url(#glow)"
                />
              ))}
            </>
          )}
          </g>
          {/* --- END: Apply zoom/pan to all interactive content --- */}

          {/* Tooltip rendering (leave outside the <g> so it doesn't scale) */}
          {showTooltip && tooltip ? (() => {
            const num = tooltip.label.replace(/\D/g, "");
            const details = ROOM_DETAILS[num];
            // Convert SVG coordinates to screen coordinates, accounting for pan and zoom
            const screenX = pan.x + tooltip.x * zoom;
            const screenY = pan.y + tooltip.y * zoom;
            return (
              <foreignObject x={screenX - 135} y={screenY - 110} width="270" height="90" style={{ pointerEvents: 'none' }}>
                <div className="bg-white/95 text-gray-800 rounded shadow-2xl px-6 py-5 animate-fade-in border border-blue-300 text-center" style={{ minWidth: 180, maxWidth: 270, boxShadow: '0 8px 32px 0 rgba(59,130,246,0.16)' }}>
                  <div className="font-bold text-lg text-blue-700">{details?.name || ROOM_NAMES[num] || tooltip.label}</div>
                  {num && <div className="text-base text-blue-400 mt-2">Room {num}</div>}
                </div>
              </foreignObject>
            );
          })() : null}

          {/* Zoom controls */}
          <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-2 bg-white/80 rounded-lg shadow p-2">
            <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="p-2 rounded hover:bg-blue-100 text-blue-600 font-bold text-xl">+</button>
            <button onClick={() => setZoom(z => Math.max(1, z - 0.2))} className="p-2 rounded hover:bg-blue-100 text-blue-600 font-bold text-xl">-</button>
          </div>
        </svg>

        {/* Location Details Panel - responsive */}
        {selectedLocation && (
          <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto w-full md:w-[370px] bg-white/60 backdrop-blur-lg border border-blue-200 rounded-2xl shadow-2xl p-6 animate-fade-in max-h-[60vh] overflow-y-auto z-50" style={{ boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18)' }}>
            {/* Blue accent bar */}
            <div className="h-2 w-16 rounded-b-xl bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-4" />
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRoomTypeIcon(selectedLocation?.objectName || null)}
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {(() => {
                      const num = selectedLocation?.objectName?.replace('info_', '') || '';
                      const details = ROOM_DETAILS[num];
                      return details?.name || selectedLocation?.objectName;
                    })()}
                </h3>
                </div>
                <button
                  onClick={() => { setSelectedLocation(null); setSelectedRoutingId(null); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
      </div>

              {/* Show all details here */}
              {(() => {
                const num = selectedLocation?.objectName?.replace('info_', '') || '';
                const details = ROOM_DETAILS[num];
                return details ? (
                  <>
                    {details.description && (
                      <p className="text-base text-gray-700 border-l-4 border-blue-400 pl-4 italic">{details.description}</p>
                    )}
                    {details.workingHours && (
                      <div className="flex items-center gap-2 text-sm bg-blue-50/70 p-2 rounded-lg mt-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                        <span className="text-blue-700 font-medium">{details.workingHours}</span>
                </div>
              )}
                    {details.contact && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                        <span className="text-blue-700 font-semibold">{details.contact}</span>
                </div>
              )}
                  </>
                ) : null;
              })()}

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-6">
                {selectedStart === selectedRoutingId ? (
                  <button
                    className="flex-1 border border-red-400 text-red-500 py-1.5 rounded-lg bg-white hover:bg-red-50 transition flex items-center justify-center gap-1 text-sm shadow-sm hover:scale-[1.04]"
                    onClick={() => setSelectedStart(null)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Remove Start
                  </button>
                ) : (
                  <button
                    className="flex-1 bg-gradient-to-r from-green-200 to-green-400 text-green-900 py-1.5 rounded-lg border border-green-300 shadow-sm hover:from-green-300 hover:to-green-500 transition flex items-center justify-center gap-1 text-sm hover:scale-[1.04]"
                    onClick={() => handleMakeStart(selectedRoutingId)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l14-7v14L5 12z" />
                    </svg>
                    Make Start
                  </button>
                )}
                {selectedEnd === selectedRoutingId ? (
                  <button
                    className="flex-1 border border-red-400 text-red-500 py-1.5 rounded-lg bg-white hover:bg-red-50 transition flex items-center justify-center gap-1 text-sm shadow-sm hover:scale-[1.04]"
                    onClick={() => setSelectedEnd(null)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove Destination
                  </button>
                ) : (
                  <button
                    className="flex-1 bg-gradient-to-r from-red-200 to-red-400 text-red-900 py-1.5 rounded-lg border border-red-300 shadow-sm hover:from-red-300 hover:to-red-500 transition flex items-center justify-center gap-1 text-sm hover:scale-[1.04]"
                    onClick={() => handleMakeEnd(selectedRoutingId)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 3v18M17 21l4-4m-4 4l-4-4" />
                    </svg>
                    Make Destination
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndoorMap; 