import React from 'react';

interface LShapeProps {
  width?: number;        // Horizontal size of the L-shape
  height?: number;       // Vertical size of the L-shape
  thickness?: number;
  color?: string;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
  direction?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}


const LShape: React.FC<LShapeProps> = ({
  width = 24,
  height = 24,
  thickness = 2,
  color = 'currentColor',
  radius = 24,
  className = '',
  style = {},
  direction = 'bottom-left',
}) => {
  const halfThickness = thickness / 2;
  const effectiveWidth = width - halfThickness;
  const effectiveHeight = height - halfThickness;
  const effectiveRadius = Math.min(radius, effectiveWidth, effectiveHeight) / 2;

  const getPathData = () => {
    switch (direction) {
      case 'top-left':
        return `M${halfThickness},${effectiveHeight}
                V${effectiveRadius + halfThickness}
                Q${halfThickness},${halfThickness} ${effectiveRadius + halfThickness},${halfThickness}
                H${effectiveWidth}`;
      case 'top-right':
        return `M${halfThickness},${halfThickness}
                H${effectiveWidth - effectiveRadius}
                Q${effectiveWidth},${halfThickness} ${effectiveWidth},${effectiveRadius + halfThickness}
                V${effectiveHeight}`;
      case 'bottom-right':
        return `M${effectiveWidth},${halfThickness}
                V${effectiveHeight - effectiveRadius}
                Q${effectiveWidth},${effectiveHeight} ${effectiveWidth - effectiveRadius},${effectiveHeight}
                H${halfThickness}`;
      case 'bottom-left':
      default:
        return `M${effectiveWidth},${effectiveHeight}
                H${effectiveRadius + halfThickness}
                Q${halfThickness},${effectiveHeight} ${halfThickness},${effectiveHeight - effectiveRadius}
                V${halfThickness}`;
    }
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`l-shape ${className}`}
      style={style}
    >
      <path
        d={getPathData()}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};


export default LShape;
