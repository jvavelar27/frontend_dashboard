import React from 'react';

export default function SegmentedControl({ options, value, onChange, className = '' }) {
    return (
        <div className={`inline-flex bg-[var(--bg-soft)] border border-[var(--card-border)] rounded-xl p-1.5 gap-1 ${className}`}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`
            px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 relative
            ${value === opt.value
                            ? 'bg-[var(--accent-solid)] text-white shadow-sm -translate-y-[1px]'
                            : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                        }
          `}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
