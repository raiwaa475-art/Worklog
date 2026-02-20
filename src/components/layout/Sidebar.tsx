'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  History,
  Settings,
  BarChart3,
  Moon,
  Zap
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'แผงควบคุม', icon: LayoutDashboard, path: '/' },
    { name: 'สินค้าทั้งหมด', icon: Package, path: '/products' },
    { name: 'ประวัติการโพสต์', icon: History, path: '/history' },
    { name: 'การวิเคราะห์', icon: BarChart3, path: '/analytics' },
    { name: 'ตั้งค่า', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon glass">
          <Zap size={24} className="gradient-text" fill="currentColor" />
        </div>
        <span className="logo-text">Trend<span className="gradient-text">Genie</span></span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={20} className={isActive ? 'gradient-text' : ''} />
              <span>{item.name}</span>
              {isActive && <div className="active-indicator" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer glass">
        <div className="user-profile">
          <div className="avatar glass">AU</div>
          <div className="user-info">
            <p className="user-name">ผู้ดูแลระบบ</p>
            <p className="user-role">แพ็คเกจ Creator</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 40px 24px;
          border-right: 1px solid var(--card-border);
          z-index: 1000;
          background: rgba(10, 10, 12, 0.95);
          backdrop-filter: blur(20px);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
            width: 80% !important;
            max-width: 300px;
            box-shadow: none;
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: 20px 0 50px rgba(0, 0, 0, 0.5);
          }
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 70px;
          padding-left: 5px;
        }

        .logo-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          box-shadow: 0 0 20px var(--primary-glow);
        }

        .logo-text {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        :global(.nav-item) {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          color: var(--text-dim);
          text-decoration: none !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer !important;
          pointer-events: auto !important;
        }

        :global(.nav-item:hover) {
          background: rgba(255, 255, 255, 0.05);
          color: var(--foreground);
          transform: translateX(4px);
        }

        :global(.nav-item.active) {
          background: rgba(99, 102, 241, 0.15);
          color: white;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: var(--primary);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 15px var(--primary);
        }

        .sidebar-footer {
          margin-top: auto;
          padding: 20px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--card-border);
          background: rgba(255, 255, 255, 0.02);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .user-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: white;
        }

        .user-role {
          font-size: 0.8rem;
          color: var(--text-dim);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
