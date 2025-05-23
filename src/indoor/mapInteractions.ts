import { VertexData } from '../data/indoor/ground/graphData';
import { getShortDisplayName } from './roomHelpers';

/**
 * Represents the state of map interactions
 */
export interface MapInteractionState {
  zoom: number;
  pan: { x: number; y: number };
  isPanning: boolean;
  panStart: { x: number; y: number } | null;
  hoveredVertex: string | null;
  tooltip: { x: number; y: number; label: string } | null;
  showTooltip: boolean;
}

/**
 * Handles mouse movement on the map
 */
export const handleMouseMove = (
  e: React.MouseEvent<SVGSVGElement>,
  svgRef: React.RefObject<SVGSVGElement>,
  setHoveredVertex: (vertex: string | null) => void,
  isPanning: boolean,
  panStart: { x: number; y: number } | null,
  setPan: (pan: { x: number; y: number }) => void
): void => {
  if (!svgRef.current) return;
  
  const svg = svgRef.current;
  const point = svg.createSVGPoint();
  point.x = e.clientX;
  point.y = e.clientY;
  
  const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
  setHoveredVertex(svgPoint.x.toFixed(2) + ',' + svgPoint.y.toFixed(2));

  if (isPanning && panStart) {
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }
};

/**
 * Handles mouse down for panning
 */
export const handleMouseDown = (
  e: React.MouseEvent<SVGSVGElement>,
  setIsPanning: (isPanning: boolean) => void,
  setPanStart: (start: { x: number; y: number } | null) => void,
  pan: { x: number; y: number }
): void => {
  setIsPanning(true);
  setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
};

/**
 * Handles mouse up to stop panning
 */
export const handleMouseUp = (
  setIsPanning: (isPanning: boolean) => void,
  setPanStart: (start: { x: number; y: number } | null) => void
): void => {
  setIsPanning(false);
  setPanStart(null);
};

/**
 * Handles wheel events for zooming
 */
export const handleWheel = (
  e: React.WheelEvent<SVGSVGElement>,
  zoom: number,
  setZoom: (zoom: number) => void,
  minZoom: number,
  maxZoom: number
): void => {
  e.preventDefault();
  let newZoom = zoom - e.deltaY * 0.001;
  newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
  setZoom(newZoom);
};

/**
 * Handles touch start for mobile panning
 */
export const handleTouchStart = (
  e: React.TouchEvent<SVGSVGElement>,
  setIsPanning: (isPanning: boolean) => void,
  setPanStart: (start: { x: number; y: number } | null) => void,
  pan: { x: number; y: number }
): void => {
  if (e.touches.length === 1) {
    setIsPanning(true);
    setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
  }
};

/**
 * Handles touch move for mobile panning
 */
export const handleTouchMove = (
  e: React.TouchEvent<SVGSVGElement>,
  isPanning: boolean,
  panStart: { x: number; y: number } | null,
  setPan: (pan: { x: number; y: number }) => void
): void => {
  if (!isPanning || !panStart || e.touches.length !== 1) return;
  setPan({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
};

/**
 * Handles touch end to stop panning
 */
export const handleTouchEnd = (
  setIsPanning: (isPanning: boolean) => void,
  setPanStart: (start: { x: number; y: number } | null) => void
): void => {
  setIsPanning(false);
  setPanStart(null);
};

/**
 * Handles vertex mouse enter for tooltips
 */
export const handleVertexMouseEnter = (
  vertex: VertexData | string | null,
  setHoveredVertex: (vertex: string | null) => void,
  setTooltip: (tooltip: { x: number; y: number; label: string } | null) => void,
  setShowTooltip: (show: boolean) => void,
  tooltipTimer: React.MutableRefObject<NodeJS.Timeout | null>,
  currentGraphData?: { vertices: VertexData[] }
): void => {
  if (typeof vertex === 'string' && currentGraphData) {
    const vertexData = currentGraphData.vertices.find(v => v.id === vertex);
    if (vertexData) {
      setHoveredVertex(vertex);
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => {
        setTooltip({ x: vertexData.cx, y: vertexData.cy, label: getShortDisplayName(vertexData.objectName) });
        setShowTooltip(true);
      }, 200);
    }
  } else if (vertex && typeof vertex === 'object' && 'cx' in vertex) {
    setHoveredVertex(vertex.id);
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => {
      setTooltip({ x: vertex.cx, y: vertex.cy, label: getShortDisplayName(vertex.objectName) });
      setShowTooltip(true);
    }, 200);
  }
};

/**
 * Handles vertex mouse leave to hide tooltips
 */
export const handleVertexMouseLeave = (
  setHoveredVertex: (vertex: string | null) => void,
  setTooltip: (tooltip: { x: number; y: number; label: string } | null) => void,
  setShowTooltip: (show: boolean) => void,
  tooltipTimer: React.MutableRefObject<NodeJS.Timeout | null>
): void => {
  setHoveredVertex(null);
  setTooltip(null);
  setShowTooltip(false);
  if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
};

/**
 * Handles vertex click for selection
 */
export const handleVertexClick = (
  vertex: VertexData,
  selectionMode: 'start' | 'end' | null,
  setSelectedStart: (start: string | null) => void,
  setSelectedEnd: (end: string | null) => void,
  setSelectionMode: (mode: 'start' | 'end' | null) => void,
  selectedStart: string | null,
  selectedEnd: string | null,
  findShortestPath: (start: string, end: string, graphData: any) => VertexData[],
  setPath: (path: VertexData[]) => void,
  currentGraphData: any,
  setSelectedLocation: (location: VertexData | null) => void,
  setSelectedRoutingId: (id: string | null) => void
): void => {
  // Convert info point to actual door point
  const getDoorId = (infoPoint: string): string | null => {
    if (infoPoint === 'info_wc_male') {
      // Find the Male WC door node
      const doorVertex = currentGraphData.vertices.find((v: VertexData) => v.objectName === 'Male WC');
      return doorVertex?.id || null;
    }
    if (infoPoint === 'info_wc_female') {
      // Find the Female WC door node
      const doorVertex = currentGraphData.vertices.find((v: VertexData) => v.objectName === 'Female WC');
      return doorVertex?.id || null;
    }
    const pointNumber = infoPoint.replace('info_', '');
    const doorVertex = currentGraphData.vertices.find((v: VertexData) => v.objectName === pointNumber);
    return doorVertex?.id || null;
  };

  let locationId = vertex.id;
  if (vertex.objectName?.startsWith('info_')) {
    const doorId = getDoorId(vertex.objectName);
    if (doorId) {
      locationId = doorId;
    }
  }

  if (selectionMode === 'start') {
    setSelectedStart(locationId);
    setSelectionMode('end');
    if (selectedEnd) {
      const newPath = findShortestPath(locationId, selectedEnd, currentGraphData);
      setPath(newPath);
    }
    return;
  } else if (selectionMode === 'end') {
    setSelectedEnd(locationId);
    setSelectionMode(null);
    if (selectedStart) {
      const newPath = findShortestPath(selectedStart, locationId, currentGraphData);
      setPath(newPath);
    }
    return;
  }

  // If not in selection mode, just update the selected location
  setSelectedLocation(vertex);
  setSelectedRoutingId(locationId);
}; 