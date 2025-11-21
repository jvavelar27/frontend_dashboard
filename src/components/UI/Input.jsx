import React from 'react';

export default function Input({ className = '', ...props }) {
    return (
        <input
            className={`
        w-full bg-[var(--bg-soft)] text-[var(--text)] border border-[var(--card-border)] rounded-xl px-4 py-3
        outline-none text-sm transition-all duration-200 backdrop-blur-md
        placeholder:text-[var(--muted-soft)]
        focus:border-[var(--accent-solid)] focus:shadow-[var(--ring)] focus:bg-[var(--surface)] focus:-translate-y-[1px]
        hover:not(:focus):-translate-y-[1px] hover:not(:focus):border-[var(--muted)]
        ${className}
      `}
            {...props}
        />
    );
}

export function TextArea({ className = '', ...props }) {
    return (
        <textarea
            className={`
        w-full bg-[var(--bg-soft)] text-[var(--text)] border border-[var(--card-border)] rounded-xl px-4 py-3
        outline-none text-sm transition-all duration-200 backdrop-blur-md min-h-[120px] resize-y
        placeholder:text-[var(--muted-soft)]
        focus:border-[var(--accent-solid)] focus:shadow-[var(--ring)] focus:bg-[var(--surface)] focus:-translate-y-[1px]
        hover:not(:focus):-translate-y-[1px] hover:not(:focus):border-[var(--muted)]
        ${className}
      `}
            {...props}
        />
    );
}
