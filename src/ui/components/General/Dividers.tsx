import React from "react";

export function Delimiter({ position }: { position: 'left' | 'right' }) {
    return (
        <div
            className={`dividers-delimiter dividers-delimiter-${position}`}
        />
    );
}

interface FadingDividerProps {
    direction?: 'horizontal' | 'vertical';
    height?: string;
    width?: string;
    margin?: string;
}

export const FadingDivider: React.FC<FadingDividerProps> = (
    {
        direction = 'horizontal',
        height = '10px',
        width = '100%',
        margin = ''
    }) => {
    return (
        <div
            className={`dividers-fading-divider dividers-fading-divider-${direction}`}
            style={{ height, width, margin }}
        />
    );
};