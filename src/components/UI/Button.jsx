import React from 'react';

export default function Button({ children, variant = 'default', className = '', ...props }) {
    const variants = {
        default: 'bg-[var(--bg-soft)] border-[var(--card-border)] text-[var(--text)] hover:shadow-[var(--shadow-lg)]',
        primary: 'bg-[var(--accent)] border-transparent text-white shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow),var(--shadow-lg)]',
        secondary: 'bg-[var(--surface)] border-[var(--card-border)] text-[var(--text)]',
        danger: 'bg-[var(--danger)] border-transparent text-white shadow-[var(--shadow-glow)]',
    };

    return (
        <button
            className={`
        relative inline-flex items-center justify-center gap-2.5 h-11 px-5 rounded-xl border
        font-semibold text-sm transition-all duration-200 overflow-hidden
        hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${variants[variant] || variants.default}
        ${className}
      `}
            {...props}
        >
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out" />

            <span className="relative flex items-center gap-2">
                {children}
            </span>
        </button>
    );
}
