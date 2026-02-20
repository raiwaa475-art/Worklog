'use client';

import React from 'react';
import {
  Users,
  MousePointer2,
  Eye,
  Share2,
  TrendingUp,
  BrainCircuit,
  Calendar,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Mon', reach: 4000, clicks: 2400 },
  { name: 'Tue', reach: 3000, clicks: 1398 },
  { name: 'Wed', reach: 2000, clicks: 9800 },
  { name: 'Thu', reach: 2780, clicks: 3908 },
  { name: 'Fri', reach: 1890, clicks: 4800 },
  { name: 'Sat', reach: 2390, clicks: 3800 },
  { name: 'Sun', reach: 3490, clicks: 4300 },
];

export default function Dashboard() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [showRunOptions, setShowRunOptions] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [selectedCount, setSelectedCount] = React.useState(5);
  const [selectedStyle, setSelectedStyle] = React.useState('different'); // 'similar' or 'different'
  const [statsData, setStatsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const [isSyncing, setIsSyncing] = React.useState(false);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStatsData(data);
        if (data.productCount) setSelectedCount(data.productCount);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const runEngine = async () => {
    setShowRunOptions(false);
    setIsRunning(true);
    try {
      const response = await fetch('/api/cron/post-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productCount: selectedCount,
          style: selectedStyle
        })
      });
      const resData = await response.json();
      if (resData.success) {
        setShowSuccess(true);
        const refreshResponse = await fetch('/api/stats');
        const refreshedData = await refreshResponse.json();
        setStatsData(refreshedData);
      } else {
        alert('เกิดข้อผิดพลาด: ' + resData.error);
      }
    } catch (e) {
      console.error(e);
      alert('เซิร์ฟเวอร์ขัดข้อง');
    } finally {
      setIsRunning(false);
    }
  };

  const runSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/cron/sync-facebook', { method: 'POST' });
      const resData = await response.json();
      if (resData.success) {
        const refreshResponse = await fetch('/api/stats');
        const refreshedData = await refreshResponse.json();
        setStatsData(refreshedData);
        alert(`ซิงค์ข้อมูลล่าสุดสำเร็จแล้ว! ดึงข้อมูลอัปเดตจากโพสต์ ${resData.updatedCount} รายการ`);
      } else {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล: ' + resData.error);
      }
    } catch (e) {
      console.error(e);
      alert('เซิร์ฟเวอร์ขัดข้องระหว่างดึงประวัติ');
    } finally {
      setIsSyncing(false);
    }
  };

  const chartData = React.useMemo(() => {
    if (!statsData?.recentPosts) return [];

    // Generate a simple trend based on current reach/clicks to avoid empty chart
    // In a real app, this would come from a history API
    const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
    const totalReach = parseInt(statsData?.stats?.totalReach?.toString()?.replace(/,/g, '') || '0');
    const totalClicks = parseInt(statsData?.stats?.totalClicks?.toString()?.replace(/,/g, '') || '0');

    return days.map((day) => ({
      name: day,
      reach: 0,
      clicks: 0
    }));
  }, [statsData]);

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div className="greeting">
          <h1>แผงควบคุม <span className="gradient-text">ภาพรวม</span></h1>
          <p className="text-dim">ยินดีต้อนรับกลับมา! นี่คือสรุปการทำงานของ AI ของคุณ</p>
        </div>
        <div className="header-actions">
          <button
            className={`text-btn glass ${isSyncing ? 'loading' : ''}`}
            onClick={runSync}
            disabled={isSyncing || loading}
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            <span>ซิงค์สถิติ Facebook</span>
          </button>

          <div className="current-date glass">
            <Calendar size={18} />
            <span>{new Date().toLocaleDateString('th-TH', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <button
            className={`btn-primary glass ${isRunning ? 'loading' : ''}`}
            onClick={() => setShowRunOptions(true)}
            disabled={isRunning}
          >
            <BrainCircuit size={18} className={isRunning ? 'animate-spin' : ''} />
            <span>เริ่มระบบ AI Engine</span>
          </button>
        </div>
      </header>

      {/* Options Modal */}
      {showRunOptions && (
        <div className="modal-overlay" onClick={() => setShowRunOptions(false)}>
          <div className="options-modal glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>กำหนดค่าการวิเคราะห์ <span className="gradient-text">Genie AI</span></h2>
              <p className="text-dim">เลือกสไตล์และจำนวนสินค้าที่ต้องการโพสต์ในรอบนี้</p>
            </div>

            <div className="modal-body">
              <div className="option-group">
                <label>จำนวนสินค้า (1 - 20 ชิ้น)</label>
                <div className="range-display">
                  <input
                    type="range" min="1" max="20"
                    value={selectedCount}
                    onChange={e => setSelectedCount(parseInt(e.target.value))}
                    className="modal-slider"
                  />
                  <span className="count-badge">{selectedCount} ชิ้น</span>
                </div>
              </div>

              <div className="option-group">
                <label>สไตล์ความต่อเนื่องของคอนเทนต์</label>
                <div className="style-selector">
                  <button
                    className={`style-btn icon-3d-wrap ${selectedStyle === 'similar' ? 'active' : ''}`}
                    onClick={() => setSelectedStyle('similar')}
                  >
                    <div className="icon-3d-box">
                      <svg viewBox="0 0 24 24" className="icon-svg-3d primary-glow-svg">
                        <defs>
                          <linearGradient id="grad-similar" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: 'var(--secondary)', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        <circle cx="12" cy="12" r="10" fill="none" stroke="url(#grad-similar)" strokeWidth="0.5" opacity="0.3" />
                        <path fill="url(#grad-similar)" d="M12,6A6,6 0 1,0 18,12A6,6 0 0,0 12,6M12,16A4,4 0 1,1 16,12A4,4 0 0,1 12,16Z" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                      </svg>
                    </div>
                    <span>คล้ายโพสต์เดิม</span>
                    <small>รักษาสมดุลและฟีลลิ่งเดิม</small>
                  </button>
                  <button
                    className={`style-btn icon-3d-wrap ${selectedStyle === 'different' ? 'active' : ''}`}
                    onClick={() => setSelectedStyle('different')}
                  >
                    <div className="icon-3d-box">
                      <svg viewBox="0 0 24 24" className="icon-svg-3d accent-glow-svg">
                        <defs>
                          <linearGradient id="grad-different" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        <path fill="url(#grad-different)" d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                        <path fill="rgba(255,255,255,0.2)" d="M12,2L12,18L18.79,21L19.5,20.29L12,2Z" />
                      </svg>
                    </div>
                    <span>ห้ามซ้ำเดิม!</span>
                    <small>ฉีกแนวใหม่ๆ เพื่อความตื่นเต้น</small>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRunOptions(false)}>ยกเลิก</button>
              <button className="btn-confirm-run" onClick={runEngine}>
                <BrainCircuit size={18} /> ยืนยันและเริ่มงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay success-overlay" onClick={() => setShowSuccess(false)}>
          <div className="options-modal success-modal glass animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="success-animation-container">
              <svg className="checkmark-3d" viewBox="0 0 100 100">
                <circle className="checkmark-bg" cx="50" cy="50" r="45" />
                <path className="checkmark-check" d="M30 50 L45 65 L70 35" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <circle className="checkmark-glow" cx="50" cy="50" r="45" />
              </svg>
              <div className="confetti-particles">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>

            <div className="modal-header" style={{ display: 'block', textAlign: 'center' }}>
              <h2 className="gradient-text">วิเคราะห์และโพสต์สำเร็จ!</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '8px' }}>
                Genie AI ได้ทำการวิเคราะห์เทรนด์ และโพสต์สินค้าลงเพจให้คุณเรียบร้อยแล้ว
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center', marginTop: '32px' }}>
              <button className="btn-confirm-run" style={{ padding: '12px 64px', width: 'auto' }} onClick={() => setShowSuccess(false)}>
                ยอดเยี่ยม!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Loading Overlay */}
      {isRunning && (
        <div className="ai-overlay">
          <div className="ai-loader-content">
            <div className="brain-container">
              <svg className="ai-brain-icon animate-pulse" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px', margin: 'auto' }}>
                <defs>
                  <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                  <filter id="blurGlow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="url(#neonGlow)" strokeWidth="4" strokeDasharray="30 20" className="spin-loader" />
                <path d="M70,100 L95,120 L135,70" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                <circle cx="100" cy="100" r="95" fill="none" stroke="url(#neonGlow)" strokeWidth="1" opacity="0.4" filter="url(#blurGlow)" />
                <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5 5" className="spin-loader-fast" />
              </svg>
            </div>
            <div className="ai-status text-center">
              <h2 className="gradient-text animate-pulse mb-4 text-3xl font-bold tracking-wide">Genie AI Synapse Active</h2>
              <p className="loading-text-sub max-w-md mx-auto">กำลังสแกน Quantum Data Matrix และเจาะลึก Consumer Insight เชิงพฤติกรรม เพื่อสังเคราะห์คอนเทนต์ที่อิมแพคที่สุด...</p>
            </div>
          </div>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          title="การเข้าถึงทั้งหมด"
          value={statsData?.stats?.totalReach || "0"}
          change="0%"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="จำนวนการคลิก"
          value={statsData?.stats?.totalClicks || "0"}
          change="0%"
          trend="up"
          icon={MousePointer2}
        />
        <StatCard
          title="สินค้าที่พร้อมโพสต์"
          value={statsData?.totalProducts || "0"}
          change="เรียลไทม์"
          trend="up"
          icon={ShoppingBag}
        />
        <StatCard
          title="โพสต์ทั้งหมด"
          value={statsData?.recentPosts?.length || "0"}
          change="ประวัติ"
          trend="up"
          icon={Share2}
        />
      </section>

      <div className="main-grid">
        <section className="chart-section glass">
          <div className="section-header">
            <h3>แนวโน้มประสิทธิภาพ</h3>
            <div className="chart-legend">
              <span className="dot reach"></span> การเข้าถึง
              <span className="dot clicks"></span> ยอดคลิก
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 25, 0.9)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area type="monotone" dataKey="reach" stroke="var(--primary)" fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="clicks" stroke="var(--accent)" fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="recent-posts-section glass">
          <div className="section-header">
            <h3>โพสต์ล่าสุดจาก AI</h3>
            <button className="text-btn">ดูทั้งหมด</button>
          </div>
          <div className="posts-list">
            {statsData?.recentPosts?.length > 0 ? (
              statsData.recentPosts.map((post: any) => (
                <div key={post.id} className="post-item glass">
                  <div className="post-thumb glass">
                    <TrendingUp size={20} className="gradient-text" />
                  </div>
                  <div className="post-info">
                    <p className="post-caption" title={post.caption}>"{post.caption}"</p>
                    <div className="post-meta">
                      <span>ธีม: {post.theme}</span>
                      <span className="dot"></span>
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุวันที่'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state text-dim">ยังไม่มีการสร้างโพสต์ กด "เริ่มระบบ AI Engine" เพื่อเริ่มงาน!</div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-out;
        }

        .options-modal {
          width: 500px;
          max-width: 90vw;
          padding: 32px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(20, 20, 25, 0.95);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: scaleUp 0.3s ease-out;
        }

        @media (max-width: 480px) {
          .options-modal {
            padding: 20px;
          }
          .style-selector {
            grid-template-columns: 1fr;
          }
          .modal-header h2 { font-size: 1.2rem; }
        }

        /* Success Modal & 3D Animation */
        .success-overlay {
          background: rgba(0, 0, 0, 0.6);
        }

        .success-animation-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 24px;
        }

        .checkmark-3d {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 20px rgba(74, 222, 128, 0.5));
        }

        .checkmark-bg {
          fill: #4ade80;
          animation: checkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          transform-origin: center;
          transform: scale(0);
        }

        .checkmark-check {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: checkDraw 0.6s ease-out 0.4s forwards;
        }

        .checkmark-glow {
          fill: none;
          stroke: #4ade80;
          stroke-width: 2;
          opacity: 0;
          transform-origin: center;
          animation: checkGlow 1.5s ease-out 0.8s infinite;
        }

        @keyframes checkPop {
          to { transform: scale(1); }
        }

        @keyframes checkDraw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes checkGlow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .confetti-particles span {
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0;
        }

        .confetti-particles span:nth-child(1) { top: 20%; left: 20%; background: #4ade80; animation: particleOut1 1s ease-out 0.5s forwards; }
        .confetti-particles span:nth-child(2) { top: 20%; right: 20%; background: #6366f1; animation: particleOut2 1s ease-out 0.6s forwards; }
        .confetti-particles span:nth-child(3) { bottom: 20%; left: 20%; background: #a855f7; animation: particleOut3 1s ease-out 0.7s forwards; }
        .confetti-particles span:nth-child(4) { bottom: 20%; right: 20%; background: #22d3ee; animation: particleOut4 1s ease-out 0.8s forwards; }
        .confetti-particles span:nth-child(5) { top: 50%; right: 0%; background: #f43f5e; animation: particleOut5 1s ease-out 0.9s forwards; }

        @keyframes particleOut1 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-40px, -40px) scale(0); opacity: 0; } }
        @keyframes particleOut2 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(40px, -40px) scale(0); opacity: 0; } }
        @keyframes particleOut3 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(-40px, 40px) scale(0); opacity: 0; } }
        @keyframes particleOut4 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(40px, 40px) scale(0); opacity: 0; } }
        @keyframes particleOut5 { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(50px, 0) scale(0); opacity: 0; } }

        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header h2 { font-size: 1.5rem; margin-bottom: 4px; }
        .modal-body { margin: 32px 0; display: flex; flex-direction: column; gap: 24px; }
        
        .option-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-dim);
          margin-bottom: 12px;
        }

        .range-display {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .modal-slider {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          appearance: none;
        }

        .modal-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          box-shadow: 0 0 10px var(--primary-glow);
        }

        .count-badge {
          background: var(--primary);
          padding: 4px 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .style-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .style-btn {
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .icon-3d-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }

        .icon-svg-3d {
          width: 24px;
          height: 24px;
          filter: drop-shadow(0 0 8px currentColor);
        }

        .primary-glow-svg { color: var(--primary); }
        .accent-glow-svg { color: var(--accent); }

        .style-btn:hover .icon-3d-box {
          transform: translateY(-4px) scale(1.05);
          background: rgba(255, 255, 255, 0.08);
          border-color: currentColor;
        }

        .style-btn.active .icon-3d-box {
          background: var(--primary);
          color: white;
          border-color: white;
          box-shadow: 0 8px 20px var(--primary-glow);
        }

        .style-btn.active.icon-3d-wrap:last-child .icon-3d-box {
          background: var(--accent);
          box-shadow: 0 8px 20px rgba(34, 211, 230, 0.3);
        }

        .style-btn small { opacity: 0.6; font-size: 0.75rem; }
        .style-btn:hover { border-color: var(--primary); background: rgba(255, 255, 255, 0.08); }
        .style-btn.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.15); box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }

        .modal-footer {
          display: flex;
          gap: 12px;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-dim);
          cursor: pointer;
        }

        .btn-confirm-run {
          flex: 2;
          padding: 12px;
          border-radius: 12px;
          background: var(--primary);
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px var(--primary-glow);
        }

        .ai-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(10, 10, 12, 0.85);
          backdrop-filter: blur(20px);
          z-index: 9999999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.4s ease-out;
        }

        .ai-loader-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .brain-container {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-brain-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 20px var(--primary-glow));
          position: relative;
          z-index: 2;
          animation: brainPulse 2s infinite ease-in-out;
        }

        .progress-3d-ring {
            position: absolute;
            width: 160px;
            height: 160px;
            z-index: 1;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
        }

        .progress-3d-ring circle {
            fill: none;
            stroke-width: 4;
        }

        .progress-3d-ring .bg { stroke: rgba(255,255,255,0.05); }

        .progress-3d-ring .bar {
            stroke: url(#grad3loader);
            stroke-dasharray: 282.6;
            stroke-linecap: round;
            filter: url(#glow3loader);
            transform-origin: 50% 50%;
            transform: rotate(-90deg);
        }

        .spin-loader {
            animation: draw3Dloader 2s ease-in-out infinite alternate, spin3Dloader 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes spin3Dloader { 100% { transform: rotate(270deg); } }
        @keyframes draw3Dloader { 0% { stroke-dashoffset: 282.6; } 100% { stroke-dashoffset: 50; } }

        @keyframes brainPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px var(--primary-glow)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 40px var(--primary-glow)); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .greeting h1 {
          font-size: 2.5rem;
          margin-bottom: 8px;
        }

        .header-actions {
          display: flex;
          gap: 16px;
        }

        .current-date {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          font-weight: 500;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px var(--primary-glow);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--primary-glow);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .chart-section, .recent-posts-section {
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--card-border);
        }

        .chart-legend {
          display: flex;
          gap: 16px;
          font-size: 0.85rem;
          color: var(--text-dim);
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot.reach { background: var(--primary); }
        .dot.clicks { background: var(--accent); }

        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .post-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--card-border);
        }

        .post-thumb {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .post-info {
          flex: 1;
        }

        .post-caption {
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .post-stats {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
        }

        .text-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 1200px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .greeting h1 { font-size: 1.8rem; }
        }
      `}</style>
    </div>
  );
}
