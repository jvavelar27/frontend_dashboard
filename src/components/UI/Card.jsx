import React from 'react';

export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`
        relative bg-[var(--card)] border border-[var(--card-border)] rounded-[var(--radius)] shadow-[var(--shadow-sm)]
        hover:shadow-[var(--shadow)] hover:border-[var(--card-border)] transition-all duration-300
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`flex items-center justify-between px-6 py-5 border-b border-[var(--card-border)]/50 font-semibold text-sm text-[var(--text)] ${className}`}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}
