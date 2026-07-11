import React from 'react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div className="route-loading-fallback" role="status" aria-live="polite">
      Loading page…
    </div>
  );
};
