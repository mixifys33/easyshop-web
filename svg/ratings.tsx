import React from "react";

interface StarIconProps {
  size?: number;
  className?: string;
}

// Filled star - yellow fill with transparent border
export const StarFilled: React.FC<StarIconProps> = ({ 
  size = 16, 
  className = "" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#FACC15"
        stroke="#FACC15"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Empty star - transparent fill with yellow/gold border
export const StarOutline: React.FC<StarIconProps> = ({ 
  size = 16, 
  className = "" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="transparent"
        stroke="#FACC15"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Half star - left half yellow fill, right half transparent, yellow border
export const HalfStar: React.FC<StarIconProps> = ({ 
  size = 16, 
  className = "" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
    >
      <defs>
        <linearGradient id="halfStarGradient">
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="url(#halfStarGradient)"
        stroke="#FACC15"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};






