import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Send, MessageSquare, Brain, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
    const { sidebarCollapsed, mobileMenuOpen, closeMobileMenu } = useApp();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/leads', icon: Users, label: 'Leads' },
        { to: '/disparo', icon: Send, label: 'Disparo' },
        { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
        { to: '/memoria', icon: Brain, label: 'Memória IA' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} lg:hidden`}
                onClick={closeMobileMenu}
            />

            <aside
                className={`
          fixed lg:sticky top-0 h-screen bg-[var(--surface)] border-r border-[var(--card-border)] 
          z-40 transition-all duration-300 ease-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-[var(--sidebar-w-collapsed)]' : 'lg:w-[var(--sidebar-w)]'}
          w-[240px]
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center' : 'px-6'} mb-2`}>
                        <div className="flex items-center gap-3 text-[var(--text)]">
                            <div className="w-6 h-6 text-[var(--accent-solid)]">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 3l9 4.5v9L12 21 3 16.5v-9L12 3z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <span className={`font-semibold text-base tracking-tight transition-opacity duration-200 ${sidebarCollapsed ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
                                AMcentral
                            </span>
                        </div>
                        <button onClick={closeMobileMenu} className="ml-auto lg:hidden text-[var(--muted)]">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-[var(--accent-soft)] text-[var(--accent-solid)]'
                                        : 'text-[var(--text-soft)] hover:bg-[var(--bg-soft)] hover:text-[var(--text)]'
                                    }
                `}
                            >
                                <item.icon
                                    size={18}
                                    strokeWidth={2}
                                    className={`min-w-[18px] transition-colors ${sidebarCollapsed ? 'mx-auto' : ''}`}
                                />
                                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'opacity-100'}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer / User Profile */}
                    <div className={`p-4 border-t border-[var(--card-border)] ${sidebarCollapsed ? 'items-center justify-center' : ''} flex`}>
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-soft)] flex items-center justify-center text-[var(--muted)] text-xs font-bold">
                            JA
                        </div>
                        <div className={`ml-3 overflow-hidden transition-all duration-200 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                            <p className="text-xs font-semibold text-[var(--text)] truncate">João Avelar</p>
                            <p className="text-[10px] text-[var(--muted)] truncate">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
