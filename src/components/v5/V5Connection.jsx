import React from 'react';

export default function V5Connection({ startX, startY, endX, endY, color = "#CBD5E1" }) {
    // Calculate bezier control points for smooth curves
    const dist = Math.abs(endX - startX) * 0.5;
    const cp1x = startX + dist;
    const cp1y = startY;
    const cp2x = endX - dist;
    const cp2y = endY;

    const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
            {/* Background stronger line for visibility */}
            <path
                d={path}
                stroke="white"
                strokeWidth="4"
                fill="none"
            />
            {/* Main connection line */}
            <path
                d={path}
                stroke={color}
                strokeWidth="2"
                fill="none"
                className="transition-colors duration-300"
            />
        </svg>
    );
}
