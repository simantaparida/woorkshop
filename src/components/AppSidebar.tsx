'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FolderOpen, Wrench, Settings, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

interface AppSidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/home',
    icon: Home,
  },
  {
    label: 'Sessions',
    href: '/sessions',
    icon: FolderOpen,
  },
  {
    label: 'Tools',
    href: '/tools',
    icon: Wrench,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function AppSidebar({ mobileMenuOpen = false, setMobileMenuOpen }: AppSidebarProps = {}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isMobileOpen = mobileMenuOpen;
  const setIsMobileOpen = setMobileMenuOpen || setInternalMobileOpen;

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const isActive = (href: string) => {
    if (href === '/home') {
      return pathname === '/home';
    }
    // Special handling for Tools - include voting-board and problem-framing paths
    if (href === '/tools') {
      return pathname.startsWith('/tools') || pathname.startsWith('/voting-board') || pathname.startsWith('/problem-framing');
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle Button - Bottom (Desktop only) */}
      <div className="hidden md:flex p-3 border-t border-gray-200 items-center justify-end">
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex bg-white border-r border-gray-200 flex-col relative"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 flex flex-col md:hidden"
            >
              {/* Mobile Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link href="/home" className="flex items-center" onClick={() => setIsMobileOpen(false)}>
                  <span className="font-comfortaa text-xl font-bold text-blue-600 tracking-[0.1em]">
                    woorkshop
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </>
  );
}
