'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: LucideIcon;
    trend: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, change, icon: Icon, trend }: StatCardProps) => {
    return (
        <div className="stat-card glass animate-fade-in">
            <div className="stat-header">
                <div className="stat-icon-wrapper glass">
                    <Icon size={24} className="gradient-text" />
                </div>
                <div className={`stat-trend ${trend}`}>
                    {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
                    {change}
                </div>
            </div>
            <div className="stat-body">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{title}</p>
            </div>

            <style jsx>{`
        .stat-card {
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--card-border);
          transition: transform 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
        }

        .stat-trend {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .stat-trend.up {
          background: rgba(34, 211, 238, 0.1);
          color: var(--accent);
        }

        .stat-trend.down {
          background: rgba(248, 113, 113, 0.1);
          color: #f87171;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-title {
          font-size: 0.95rem;
          color: var(--text-dim);
          font-weight: 500;
        }
      `}</style>
        </div>
    );
};

export default StatCard;
