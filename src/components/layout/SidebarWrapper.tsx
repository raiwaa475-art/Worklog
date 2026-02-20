'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import AnimatedBackground from '../ui/AnimatedBackground';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatedBackground />
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)} />

      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="mobile-header glass">
        <div className="mobile-logo">
          <span className="logo-text">Trend<span className="gradient-text">Genie</span></span>
        </div>
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .mobile-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(15, 15, 20, 0.8);
          backdrop-filter: blur(20px);
        }

        .mobile-logo {
          font-weight: 800;
          font-size: 1.2rem;
          letter-spacing: -0.5px;
        }

        .mobile-toggle {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s ease;
          z-index: 1001;
        }

        .sidebar-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        @media (max-width: 1024px) {
          :global(.main-content) {
            margin-top: 60px;
          }
          :global(.sidebar) {
            z-index: 1002 !important;
          }
        }

        @media (min-width: 1025px) {
          .mobile-header { display: none; }
          .sidebar-overlay { display: none; }
        }
      `}</style>
    </>
  );
}
