import { VertexData } from '../data/indoor/ground/graphData';

/**
 * Represents the graph data structure for pathfinding
 */
export interface GraphData {
  vertices: VertexData[];
  edges: { from: string; to: string }[];
}

/**
 * Represents the state of a vertex during pathfinding
 */
interface VertexState {
  distance: number;
  previous: string | null;
  visited: boolean;
}

/**
 * Calculates the Euclidean distance between two vertices
 */
const calculateDistance = (v1: VertexData, v2: VertexData): number => {
  return Math.sqrt(
    Math.pow(v1.cx - v2.cx, 2) + 
    Math.pow(v1.cy - v2.cy, 2)
  );
};

/**
 * Initializes the state for all vertices in the graph
 */
const initializeVertexStates = (vertices: VertexData[]): Map<string, VertexState> => {
  const states = new Map<string, VertexState>();
  vertices.forEach(vertex => {
    states.set(vertex.id, {
      distance: Infinity,
      previous: null,
      visited: false
    });
  });
  return states;
};

/**
 * Finds the unvisited vertex with the minimum distance
 */
const findMinDistanceVertex = (states: Map<string, VertexState>): string | null => {
  let minDistance = Infinity;
  let minVertex = null;

  states.forEach((state, vertexId) => {
    if (!state.visited && state.distance < minDistance) {
      minDistance = state.distance;
      minVertex = vertexId;
    }
  });

  return minVertex;
};

/**
 * Updates the distances to neighboring vertices
 */
const updateNeighborDistances = (
  current: string,
  states: Map<string, VertexState>,
  graphData: GraphData
): void => {
  const edges = graphData.edges.filter(edge => 
    edge.from === current || edge.to === current
  );

  edges.forEach(edge => {
    const neighbor = edge.from === current ? edge.to : edge.from;
    const neighborState = states.get(neighbor);
    if (!neighborState || neighborState.visited) return;

    const fromVertex = graphData.vertices.find(v => v.id === edge.from);
    const toVertex = graphData.vertices.find(v => v.id === edge.to);
    if (!fromVertex || !toVertex) return;

    const distance = calculateDistance(fromVertex, toVertex);
    const newDistance = states.get(current)!.distance + distance;

    if (newDistance < neighborState.distance) {
      states.set(neighbor, {
        ...neighborState,
        distance: newDistance,
        previous: current
      });
    }
  });
};

/**
 * Reconstructs the path from the start to end vertex
 */
const reconstructPath = (
  end: string,
  states: Map<string, VertexState>,
  graphData: GraphData
): VertexData[] => {
  const path: VertexData[] = [];
  let current = end;

  while (current) {
    const vertex = graphData.vertices.find(v => v.id === current);
    if (vertex) path.unshift(vertex);
    current = states.get(current)?.previous || '';
  }

  return path;
};

/**
 * Finds the shortest path between two vertices using Dijkstra's algorithm
 * @param start - The ID of the starting vertex
 * @param end - The ID of the ending vertex
 * @param graphData - The graph data containing vertices and edges
 * @returns An array of vertices representing the shortest path
 */
export const findShortestPath = (start: string, end: string, graphData: GraphData): VertexData[] => {
  const states = initializeVertexStates(graphData.vertices);
  states.get(start)!.distance = 0;

  while (true) {
    const current = findMinDistanceVertex(states);
    if (!current || current === end) break;

    const currentState = states.get(current)!;
    currentState.visited = true;
    updateNeighborDistances(current, states, graphData);
  }

  return reconstructPath(end, states, graphData);
};

/**
 * Calculates the total distance of a path
 * @param path - An array of vertices representing the path
 * @returns The total distance of the path in units
 */
export const calculatePathDistance = (path: VertexData[]): number => {
  if (path.length <= 1) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(path[i], path[i + 1]);
  }
  return Math.round(totalDistance);
}; 