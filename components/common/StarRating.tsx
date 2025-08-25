import React from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const Star: React.FC<{
  filled: number;
  isInteractive: boolean;
  onMouseEnter?: () => void;
  onClick?: () => void;
}> = ({ filled, isInteractive, onMouseEnter, onClick }) => {
  const sizeClasses = 'w-5 h-5'; // Consistent size for now
  const interactionClasses = isInteractive ? 'cursor-pointer' : '';
  const clipPath = `polygon(0 0, ${filled * 100}% 0, ${filled * 100}% 100%, 0 100%)`;

  return (
    <div
      className={`relative ${sizeClasses} ${interactionClasses}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <svg className="absolute text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <svg className="absolute text-yellow-400" fill="currentColor" viewBox="0 0 20 20" style={{ clipPath }}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  );
};

const StarRating: React.FC<StarRatingProps> = ({ rating, interactive = false, onRatingChange = () => {} }) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillValue = Math.max(0, Math.min(1, displayRating - (starIndex - 1)));
        return (
          <Star
            key={starIndex}
            filled={fillValue}
            isInteractive={interactive}
            onMouseEnter={() => interactive && setHoverRating(starIndex)}
            onClick={() => interactive && onRatingChange(starIndex)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
