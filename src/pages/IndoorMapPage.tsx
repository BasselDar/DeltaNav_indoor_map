import React from 'react';
import IndoorMap from '../components/IndoorMap';

const IndoorMapPage: React.FC = () => {
  return (
      <div className="pt-16 h-full w-full relative">
        {/* Map View */}
        <div className="w-full h-full">
          <IndoorMap />
        </div>
      </div>
  );
};

export default IndoorMapPage;
