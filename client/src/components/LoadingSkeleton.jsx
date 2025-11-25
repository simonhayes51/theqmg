const LoadingSkeleton = ({ type = 'card' }) => {
  if (type === 'card') {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      </div>
    );
  }

  if (type === 'service') {
    return (
      <div className="service-card animate-pulse">
        <div className="h-20 w-20 bg-gray-700 rounded-full mx-auto mb-6"></div>
        <div className="h-8 bg-gray-700 rounded w-2/3 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6 mx-auto"></div>
      </div>
    );
  }

  if (type === 'gallery') {
    return (
      <div className="gallery-item animate-pulse">
        <div className="w-full h-full bg-gray-700 rounded-2xl"></div>
      </div>
    );
  }

  if (type === 'review') {
    return (
      <div className="review-card animate-pulse">
        <div className="flex gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 w-6 bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6 mb-6"></div>
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-full"></div>
    </div>
  );
};

export default LoadingSkeleton;
