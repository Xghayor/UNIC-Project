import React from 'react';

const SkeletonLoader: React.FC = () => (
  <div className="p-4 space-y-4">
    <div className="h-8 w-3/4 bg-gray-700 rounded-md animate-pulse"></div>
    <div className="h-8 w-1/2 bg-gray-700 rounded-md animate-pulse"></div>
    <div className="h-8 w-3/4 bg-gray-700 rounded-md animate-pulse"></div>
  </div>
);

export default SkeletonLoader;
