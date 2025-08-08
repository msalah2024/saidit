import React from 'react';

interface VerticalLineProps {
  height: number | string; // Can be pixels (number) or any CSS value (string)
  color?: string;
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const VerticalLine: React.FC<VerticalLineProps> = ({
  height = '100%',
  color = 'currentColor',
  width = '1px',
  className = '',
  style = {},
}) => {
  // Convert numeric height to pixels if needed
  const lineHeight = typeof height === 'number' ? `${height}px` : height;
  const lineWidth = typeof width === 'number' ? `${width}px` : width;

  return (
    <svg
      className={`vertical-line ${className}`}
      style={{
        width: lineWidth,
        height: lineHeight,
        ...style,
      }}
      viewBox={`0 0 ${lineWidth} ${lineHeight}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="50%"
        y1="0"
        x2="50%"
        y2="100%"
        stroke={color}
        strokeWidth="100%"
      />
    </svg>
  );
};

export default VerticalLine;