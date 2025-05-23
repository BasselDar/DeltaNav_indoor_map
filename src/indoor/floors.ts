// FloorData interface and floors array for indoor navigation
import { graphData as groundFloorData } from '../data/indoor/ground/graphData';
import { graphData as fourthFloorData } from '../data/indoor/4th/graphData';

export interface FloorData {
  id: number;
  name: string;
  shortName: string;
  description: string;
  graphData: typeof groundFloorData;
  svgPath: string;
}

export const floors: FloorData[] = [
  {
    id: 0,
    name: 'Ground Floor',
    shortName: 'G',
    description: 'Main Entrance Level',
    graphData: groundFloorData,
    svgPath: '/indoor/ground/mall-floor-plan.svg'
  },
  {
    id: 4,
    name: '4th Floor',
    shortName: '4',
    description: 'Offices & Meeting Rooms',
    graphData: fourthFloorData,
    svgPath: '/indoor/4th/4th-floor-plan.svg'
  }
]; 