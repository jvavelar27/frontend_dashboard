import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children, footer }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-[500px] bg-[var(--card)] border border-[var(--card-border)] rounded-[20px] shadow-[var(--shadow-xl)] backdrop-blur-[var(--blur)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--card-border)] bg-[var(--bg-soft)]">
                    <h3 className="font-bold text-base text-[var(--text)]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {children}
                </div>

                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[var(--card-border)] bg-[var(--bg-soft)]">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
