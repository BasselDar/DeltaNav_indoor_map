import { VertexData } from '../data/indoor/ground/graphData';
import { getDisplayName } from './roomHelpers';

/**
 * Represents the state of the sidebar
 */
export interface SidebarState {
  isSidebarOpen: boolean;
  expandedSection: 'search' | 'route' | 'floor' | null;
  startSearchQuery: string;
  endSearchQuery: string;
  selectedStart: string | null;
  selectedEnd: string | null;
}

/**
 * Filters locations based on search query
 */
export const getFilteredLocations = (
  query: string,
  graphData: { vertices: VertexData[] }
): VertexData[] => {
  return graphData.vertices
    .filter(vertex => vertex.objectName)
    .filter(vertex => {
      const displayName = getDisplayName(vertex.objectName);
      const roomNumber = vertex.objectName?.replace('info_', '') || '';
      
      return displayName.toLowerCase().includes(query.toLowerCase()) || 
             roomNumber.toLowerCase().includes(query.toLowerCase());
    });
};

/**
 * Handles location selection from search
 */
export const handleLocationSelect = (
  location: VertexData,
  selectionMode: 'start' | 'end' | null,
  setSelectedStart: (start: string | null) => void,
  setSelectedEnd: (end: string | null) => void,
  setSelectionMode: (mode: 'start' | 'end' | null) => void,
  setStartSearchQuery: (query: string) => void,
  setEndSearchQuery: (query: string) => void,
  selectedStart: string | null,
  selectedEnd: string | null,
  findShortestPath: (start: string, end: string, graphData: any) => VertexData[],
  setPath: (path: VertexData[]) => void,
  currentGraphData: any
): void => {
  let locationId = location.id;
  if (location.objectName?.startsWith('info_')) {
    const pointNumber = location.objectName.replace('info_', '');
    const doorVertex = currentGraphData.vertices.find((v: VertexData) => v.objectName === pointNumber);
    if (doorVertex) {
      locationId = doorVertex.id;
    }
  }

  // If we're in start selection mode or searching in the start search box
  if (selectionMode === 'start' || (!selectionMode && setStartSearchQuery)) {
    setSelectedStart(locationId);
    setStartSearchQuery('');
    setSelectionMode('end');
    if (selectedEnd) {
      const newPath = findShortestPath(locationId, selectedEnd, currentGraphData);
      setPath(newPath);
    }
  } else {
    setSelectedEnd(locationId);
    setEndSearchQuery('');
    setSelectionMode(null);
    if (selectedStart) {
      const newPath = findShortestPath(selectedStart, locationId, currentGraphData);
      setPath(newPath);
    }
  }
};

/**
 * Handles floor selection
 */
export const handleFloorSelect = (
  floorIndex: number,
  setCurrentFloorIndex: (index: number) => void,
  clearRoute: () => void
): void => {
  setCurrentFloorIndex(floorIndex);
  clearRoute();
};

/**
 * Handles route clearing
 */
export const handleClearRoute = (
  setSelectedStart: (start: string | null) => void,
  setSelectedEnd: (end: string | null) => void,
  setPath: (path: VertexData[]) => void,
  setSelectionMode: (mode: 'start' | 'end' | null) => void,
  setDistance: (distance: number) => void
): void => {
  setSelectedStart(null);
  setSelectedEnd(null);
  setPath([]);
  setSelectionMode(null);
  setDistance(0);
};

/**
 * Handles sidebar toggle
 */
export const handleSidebarToggle = (
  isOpen: boolean,
  setIsSidebarOpen: (isOpen: boolean) => void,
  setExpandedSection: (section: 'search' | 'route' | 'floor' | null) => void,
  section?: 'search' | 'route' | 'floor'
): void => {
  setIsSidebarOpen(isOpen);
  if (section) {
    setExpandedSection(section);
  }
};

/**
 * Handles section expansion
 */
export const handleSectionExpand = (
  section: 'search' | 'route' | 'floor',
  setExpandedSection: (section: 'search' | 'route' | 'floor' | null) => void,
  currentSection: 'search' | 'route' | 'floor' | null
): void => {
  setExpandedSection(currentSection === section ? null : section);
}; 