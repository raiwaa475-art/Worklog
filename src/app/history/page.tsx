'use client';

import React, { useState, useEffect } from 'react';
import {
    History,
    Calendar,
    ExternalLink,
    MessageSquare,
    Facebook,
    TrendingUp
} from 'lucide-react';

export default function HistoryPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                setPosts(data.recentPosts || []);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="history-page animate-fade-in">
            <header className="page-header">
                <div className="title-area">
                    <h1>ประวัติ <span className="gradient-text">การโพสต์</span></h1>
                    <p className="text-dim">ติดตามคอนเทนต์ที่ AI สร้างและโพสต์ลง Facebook ของคุณ</p>
                </div>
            </header>

            <div className="history-container glass">
                {loading ? (
                    <div className="loading-state">
                        <div className="3d-spinner mb-4 flex items-center justify-center relative w-20 h-20">
                            <svg className="progress-3d-spinner absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="gradSpinnerHistory" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--primary)" />
                                        <stop offset="100%" stopColor="var(--accent)" />
                                    </linearGradient>
                                    <filter id="glowSpinnerHistory">
                                        <feGaussianBlur stdDeviation="2" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <circle cx="50" cy="50" r="40" className="bg" />
                                <circle cx="50" cy="50" r="40" className="bar spin-loader" />
                            </svg>
                            <History size={24} className="text-primary animate-pulse relative z-10" />
                        </div>
                        <p className="gradient-text font-bold mt-2">กำลังดึงข้อมูลประวัติโพสต์...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="empty-state glass">
                        <History size={48} className="text-dim mb-4" />
                        <p>ยังไม่มีประวัติการโพสต์ เริ่มต้นสร้างโพสต์แรกได้ที่หน้าแผงควบคุม!</p>
                    </div>
                ) : (
                    <div className="posts-timeline">
                        {posts.map((post) => (
                            <div key={post.id} className="history-item glass hover-glow">
                                <div className="item-header">
                                    <div className="theme-badge glass">
                                        <TrendingUp size={14} />
                                        <span>ธีม: {post.theme}</span>
                                    </div>
                                    <div className="post-date">
                                        <Calendar size={14} />
                                        <span>
                                            {(() => {
                                                const date = post.created_at ? new Date(post.created_at) : new Date();
                                                return isNaN(date.getTime())
                                                    ? 'ไม่ระบุวันที่'
                                                    : date.toLocaleString('th-TH', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    });
                                            })()}
                                        </span>
                                    </div>
                                </div>
                                <div className="item-content">
                                    <div className="caption-box glass">
                                        <MessageSquare size={16} className="text-dim" />
                                        <p>{post.caption}</p>
                                    </div>
                                    <div className="selected-items">
                                        <p className="label">สินค้าที่เลือก:</p>
                                        <div className="tags">
                                            {post.selected_items?.map((item: string, idx: number) => (
                                                <span key={idx} className="item-tag glass">{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="item-footer">
                                    <a
                                        href={`https://facebook.com/${post.fb_post_id}`}
                                        target="_blank"
                                        className="fb-link glass"
                                    >
                                        <Facebook size={16} />
                                        ดูโพสต์จริง <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .history-page {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                .page-header { margin-bottom: 20px; }
                .history-container {
                    padding: 24px;
                    border-radius: var(--radius-lg);
                    min-height: 400px;
                }
                .loading-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 100px 0;
                    color: var(--text-dim);
                }

                .progress-3d-spinner {
                    filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
                }

                .progress-3d-spinner circle {
                    fill: none;
                    stroke-width: 6;
                    stroke-linecap: round;
                }

                .progress-3d-spinner .bg {
                    stroke: rgba(255, 255, 255, 0.05);
                }

                .progress-3d-spinner .bar {
                    stroke: url(#gradSpinnerHistory);
                    stroke-dasharray: 251.2;
                    filter: url(#glowSpinnerHistory);
                    transform-origin: 50% 50%;
                    transform: rotate(-90deg);
                }

                .spin-loader {
                    animation: drawSpinnerHistory 2s ease-in-out infinite alternate, spin3DloaderHistory 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                @keyframes spin3DloaderHistory { 100% { transform: rotate(270deg); } }
                @keyframes drawSpinnerHistory { 0% { stroke-dashoffset: 251.2; } 100% { stroke-dashoffset: 40; } }
                .posts-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .history-item {
                    padding: 20px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--card-border);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .theme-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    color: var(--primary);
                    font-weight: 600;
                }
                .post-date {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: var(--text-dim);
                }
                .caption-box {
                    padding: 16px;
                    border-radius: var(--radius-sm);
                    margin-bottom: 12px;
                    display: flex;
                    gap: 12px;
                }
                .caption-box p {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    white-space: pre-wrap;
                }
                .selected-items .label {
                    font-size: 0.8rem;
                    color: var(--text-dim);
                    margin-bottom: 8px;
                }
                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .item-tag {
                    font-size: 0.75rem;
                    padding: 4px 10px;
                    border-radius: 6px;
                    color: var(--accent);
                }
                .fb-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    color: white;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .fb-link:hover {
                    background: var(--primary);
                }

                @media (max-width: 1024px) {
                    .history-container {
                        padding: 16px;
                    }
                    .item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                }

                @media (max-width: 768px) {
                    .history-item {
                        padding: 16px;
                    }
                    .caption-box {
                        padding: 12px;
                    }
                    .caption-box p {
                        font-size: 0.85rem;
                    }
                }
            `}</style>
        </div>
    );
}
