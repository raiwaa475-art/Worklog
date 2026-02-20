'use client';

import React from 'react';
import {
    BarChart3,
    TrendingUp,
    MousePointer2,
    Users,
    ArrowUpRight,
    PieChart,
    Zap,
    ShoppingBag,
    CalendarDays
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function AnalyticsPage() {
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const categoryData = stats?.categoryStats?.map((c: any, i: number) => ({
        ...c,
        color: i === 0 ? 'var(--primary)' :
            i === 1 ? 'var(--secondary)' :
                i === 2 ? 'var(--accent)' : '#f43f5e'
    })) || [];
    const calendarData = stats?.calendarData || [];

    return (
        <div className="analytics-page animate-fade-in">
            <header className="page-header">
                <div className="title-area">
                    <h1>การวิเคราะห์ <span className="gradient-text">ประสิทธิภาพ</span></h1>
                    <p className="text-dim">เจาะลึกข้อมูลโพสต์ รายวัน รายสัปดาห์ และการเข้าถึงของลูกค้า</p>
                </div>
            </header>

            {/* Top Metrics Row */}
            <div className="metrics-row">
                <div className="metric-card glass">
                    <div className="m-icon"><Users size={24} /></div>
                    <div className="m-data">
                        <p>รายสัปดาห์ (Reach)</p>
                        <h3>{stats?.stats?.totalReachFormatted || "0"}</h3>
                        {(stats?.stats?.totalReach > 0) && <span className="small-trend up">+12.5% vs last week</span>}
                    </div>
                </div>
                <div className="metric-card glass primary-border">
                    <div className="m-icon"><TrendingUp size={24} /></div>
                    <div className="m-data">
                        <p>เฉลี่ยการเข้าชมรายวัน</p>
                        <h3>{stats?.stats?.dailyAvgView || "0"}</h3>
                        <span className="small-trend">ยอด View ต่อโพสต์</span>
                    </div>
                </div>
                <div className="metric-card glass accent-border">
                    <div className="m-icon"><MousePointer2 size={24} /></div>
                    <div className="m-data">
                        <p>Conversion Rate (CVR)</p>
                        <h3>{stats?.stats?.cvr || "0%"}</h3>
                        <span className="small-trend">จาก Reach สู่ Click</span>
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                <section className="main-content-flow">
                    {/* Calendar Section */}
                    <div className="calendar-section glass card-big mb-6">
                        <div className="card-header flex justify-between items-center mb-8">
                            <div>
                                <h3 className="flex items-center gap-2">
                                    <CalendarDays size={20} className="text-secondary" />
                                    ตารางกิจกรรมการโพสต์
                                </h3>
                                <p className="text-dim">ประวัติการทำงานของ AI ในรอบ 30 วัน</p>
                            </div>
                        </div>
                        <div className="calendar-grid-wrapper">
                            <div className="calendar-grid">
                                {calendarData.map((d: any, i: number) => {
                                    const dateObj = new Date(d.date);
                                    const isToday = new Date().toDateString() === dateObj.toDateString();
                                    return (
                                        <div
                                            key={i}
                                            className={`cal-day post-count-${Math.min(d.posts, 2)} ${isToday ? 'is-today' : ''}`}
                                            title={`${d.date}: ${d.posts} โพสต์, ${d.reach} Reach`}
                                        >
                                            <span className="day-count">{d.posts > 0 ? d.posts : ''}</span>
                                            <span className="day-label">{dateObj.getDate()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Top Products Section */}
                    <section className="chart-main glass card-big">
                        <div className="card-header">
                            <h3 className="flex items-center gap-2">
                                <ShoppingBag size={20} className="text-primary" />
                                สินค้าที่ถูกเลือกโพสต์บ่อยที่สุด
                            </h3>
                            <p className="text-dim">วิเคราะห์ความถี่ที่สินค้าแต่ละชิ้นถูกคัดเลือกโดย AI</p>
                        </div>
                        <div className="chart-wrapper mt-8">
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={stats?.topItemsData || []}
                                    layout="vertical"
                                    margin={{ left: 10, right: 40, top: 20, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        hide
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(20, 20, 25, 0.98)',
                                            border: '1px solid var(--card-border)',
                                            borderRadius: '12px',
                                            backdropFilter: 'blur(20px)',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        radius={[0, 8, 8, 0]}
                                        fill="var(--primary)"
                                        barSize={32}
                                        label={({ x, y, width, value, index, height }: any) => {
                                            const name = stats?.topItemsData[index]?.name;
                                            return (
                                                <g>
                                                    <text
                                                        x={x}
                                                        y={y - 8}
                                                        fill="rgba(255,255,255,0.7)"
                                                        fontSize="11"
                                                        fontWeight="600"
                                                    >
                                                        {name?.length > 45 ? name.substring(0, 45) + '...' : name}
                                                    </text>
                                                    <text
                                                        x={x + width + 10}
                                                        y={y + 22}
                                                        fill="var(--primary)"
                                                        fontSize="12"
                                                        fontWeight="800"
                                                    >
                                                        {value}
                                                    </text>
                                                </g>
                                            );
                                        }}
                                    >
                                        {(stats?.topItemsData || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(99, 102, 241, 0.4)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </section>

                <section className="stats-sidebar">
                    <div className="summary-card glass premium overflow-hidden">
                        <div className="premium-header flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Zap size={20} className="text-secondary animate-pulse" />
                                <h4 className="font-bold">Genie AI Insight</h4>
                            </div>
                            <span className="status-badge">Live Analysis</span>
                        </div>

                        <div className="3d-progress-container flex flex-col items-center justify-center p-6 mb-4 relative">
                            {/* 3D-effect SVG Progress Circle */}
                            <svg className="progress-3d" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="grad3d" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--primary)" />
                                        <stop offset="100%" stopColor="var(--accent)" />
                                    </linearGradient>
                                    <filter id="glow3d">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <circle className="bg" cx="50" cy="50" r="40" />
                                <circle
                                    className="bar"
                                    cx="50" cy="50" r="40"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 - (251.2 * (stats?.stats?.reachProgress || 0) / 100)}
                                    style={{
                                        stroke: (stats?.stats?.reachProgress || 0) >= 100 ? '#10b981' :
                                            (stats?.stats?.reachProgress || 0) < 30 ? '#ef4444' : 'url(#grad3d)'
                                    }}
                                />
                                <text x="50" y="45" className="pct">{stats?.stats?.reachProgress || 0}%</text>
                                <text x="50" y="65" className="goal-lbl">of Reach Target</text>
                            </svg>
                        </div>

                        <div className="insight-body glass p-4 rounded-xl border border-white/5 bg-white/2">
                            <p className="text-sm leading-relaxed">
                                {categoryData.length > 0
                                    ? `อ้างอิง "Shopping Industry 2026": สินค้าหมวด ${categoryData[0].name} มี Performance สูงสุด แนะนำเร่งโพสต์ช่วง 20:00 น.`
                                    : "กำลังวิเคราะห์..."}
                            </p>
                        </div>

                        <div className="kpi-score mt-6 flex justify-between items-center text-xs">
                            <div className="score-item">
                                <span className="text-dim">Benchmarking</span>
                                <div className={`status-pill ${(stats?.stats?.reachProgress || 0) >= 50 ? 'success' : 'warning'}`}>
                                    {(stats?.stats?.reachProgress || 0) >= 100 ? 'Exceeded' :
                                        (stats?.stats?.reachProgress || 0) >= 50 ? 'On Track' : 'Needs Action'}
                                </div>
                            </div>
                            <div className="score-item text-right">
                                <span className="text-dim">Actual vs Target</span>
                                <strong className="block text-white mt-1">
                                    {stats?.stats?.totalReachFormatted} / {stats?.stats?.reachTarget?.toLocaleString()}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="recent-activity glass mt-6">
                        <div className="card-header mb-4">
                            <h4 className="font-bold">ประวัติการบรรลุเป้าหมาย</h4>
                        </div>
                        <div className="activity-list">
                            <div className="a-item">
                                <div className={`a-dot ${(stats?.stats?.reachProgress || 0) >= 50 ? 'active-success' : 'active-warn'}`}></div>
                                <div className="a-info">
                                    <p className="text-sm">Reach 50% Milestone</p>
                                    <span className="text-xs text-dim">
                                        {(stats?.stats?.reachProgress || 0) >= 50 ? 'Achieved ✓' : 'Remaining: ' + (50 - (stats?.stats?.reachProgress || 0)) + '%'}
                                    </span>
                                </div>
                            </div>
                            <div className="a-item mt-3">
                                <div className={`a-dot ${(stats?.stats?.reachProgress || 0) >= 100 ? 'active-success' : 'active-neutral'}`}></div>
                                <div className="a-info">
                                    <p className="text-sm">Full Target Goal</p>
                                    <span className="text-xs text-dim">
                                        {(stats?.stats?.reachProgress || 0) >= 100 ? 'Completed 🎉' : 'Status: In Progress'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .analytics-page { display: flex; flex-direction: column; gap: 24px; }
                
                .metrics-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }
                
                .metric-card {
                    padding: 24px;
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    border-radius: var(--radius-lg);
                }

                .primary-border { border-left: 4px solid var(--primary); }
                .accent-border { border-left: 4px solid var(--accent); }

                .m-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                }

                .m-data p { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 4px; }
                .m-data h3 { font-size: 1.8rem; font-weight: 800; }
                .small-trend { font-size: 0.75rem; color: var(--text-dim); }
                .small-trend.up { color: #22c55e; }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(15, 1fr);
                    gap: 8px;
                }

                .cal-day {
                    aspect-ratio: 1;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.03);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    cursor: pointer;
                }

                .cal-day:hover {
                    transform: translateY(-2px);
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.1);
                }

                .cal-day.is-today {
                    border: 1px solid var(--accent);
                    background: rgba(34, 211, 238, 0.05);
                }

                .day-count {
                    font-size: 1rem;
                    font-weight: 800;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .day-label {
                    font-size: 0.6rem;
                    font-weight: 600;
                    color: var(--text-dim);
                    position: absolute;
                    bottom: 6px;
                }

                .post-count-1 { 
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.2)) !important; 
                    border: 1px solid rgba(99, 102, 241, 0.3) !important; 
                }
                .post-count-2 { 
                    background: linear-gradient(135deg, var(--primary), #4f46e5) !important; 
                    box-shadow: 0 8px 20px -5px rgba(99, 102, 241, 0.4);
                    border: 1px solid rgba(255,255,255,0.2) !important;
                }

                .progress-mini-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 20px;
                    margin: 12px 0;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--accent));
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
                    border-radius: 20px;
                    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .progress-3d {
                    width: 140px;
                    height: 140px;
                    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
                }

                .progress-3d circle {
                    fill: none;
                    stroke-width: 8;
                    stroke-linecap: round;
                    transform: rotate(-90deg);
                    transform-origin: 50% 50%;
                }

                .progress-3d circle.bg {
                    stroke: rgba(255,255,255,0.03);
                }

                .progress-3d circle.bar {
                    transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
                    filter: url(#glow3d);
                }

                .progress-3d .pct {
                    fill: white;
                    font-size: 1.2rem;
                    font-weight: 900;
                    text-anchor: middle;
                    dominant-baseline: middle;
                }

                .progress-3d .goal-lbl {
                    fill: var(--text-dim);
                    font-size: 0.5rem;
                    text-anchor: middle;
                }

                .status-badge {
                    font-size: 0.65rem;
                    padding: 4px 8px;
                    background: rgba(34, 211, 238, 0.1);
                    color: var(--accent);
                    border: 1px solid rgba(34, 211, 238, 0.2);
                    border-radius: 20px;
                    font-weight: 600;
                }

                .status-pill {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 700;
                    margin-top: 4px;
                }

                .status-pill.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

                .a-dot.active-success { background: #10b981; box-shadow: 0 0 10px #10b981; }
                .a-dot.active-warn { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
                .a-dot.active-neutral { background: var(--text-dim); }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }

                .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
                .analytics-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }
                .card-big { padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--card-border); }
                .summary-card.premium {
                    padding: 32px;
                    border-radius: var(--radius-lg);
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                }
                .recent-activity { padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--card-border); }
                .activity-list { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
                .a-item { display: flex; gap: 12px; align-items: center; }
                .a-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); }
                .a-info p { font-size: 0.85rem; margin-bottom: 2px; }
                .a-info span { font-size: 0.7rem; color: var(--text-dim); }

                @media (max-width: 1200px) {
                    .analytics-grid { grid-template-columns: 1fr; }
                    .metrics-row { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .calendar-grid { grid-template-columns: repeat(7, 1fr); }
                    .card-big { padding: 20px; }
                }
            `}</style>
        </div>
    );
}
