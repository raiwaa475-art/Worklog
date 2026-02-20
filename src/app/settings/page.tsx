'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Facebook,
    Zap,
    User,
    Bell,
    Shield,
    Save,
    ExternalLink
} from 'lucide-react';

export default function SettingsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        fbPageId: '',
        fbPageAccessToken: '',
        geminiApiKey: '',
        productCount: 5,
        isSaving: false
    });

    const fetchData = async () => {
        try {
            const [statsRes, settingsRes] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/settings')
            ]);
            const statsData = await statsRes.json();
            const settingsData = await settingsRes.json();

            setStats(statsData);
            setConfig(prev => ({
                ...prev,
                fbPageId: settingsData.fbPageId || '',
                fbPageAccessToken: settingsData.fbPageAccessToken || '',
                geminiApiKey: settingsData.geminiApiKey || '',
                productCount: settingsData.productCount || 5
            }));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        setConfig(prev => ({ ...prev, isSaving: true }));
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fbPageId: config.fbPageId,
                    fbPageAccessToken: config.fbPageAccessToken,
                    geminiApiKey: config.geminiApiKey,
                    productCount: config.productCount
                })
            });
            if (res.ok) {
                alert('บันทึกการตั้งค่าสำเร็จ!');
                fetchData(); // Refresh to see balance/status
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setConfig(prev => ({ ...prev, isSaving: false }));
        }
    };

    return (
        <div className="settings-page animate-fade-in">
            <header className="page-header">
                <div className="title-area">
                    <h1>การตั้งค่า <span className="gradient-text">ระบบ</span></h1>
                    <p className="text-dim">จัดการบัญชี การเชื่อมต่อ API และกำหนดค่าการทำงานของ AI</p>
                </div>
                <button
                    className={`btn-primary glass ${config.isSaving ? 'loading' : ''}`}
                    onClick={handleSave}
                    disabled={config.isSaving}
                >
                    <Save size={18} />
                    <span>{config.isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                </button>
            </header>

            <div className="settings-grid">
                <section className="settings-nav glass">
                    <div className="s-nav-item active"><User size={18} /> <span>โปรไฟล์ทั่วไป</span></div>
                    <div className="s-nav-item"><Facebook size={18} /> <span>การเชื่อมต่อ Facebook</span></div>
                    <div className="s-nav-item"><Zap size={18} /> <span>API & AI Engine</span></div>
                    <div className="s-nav-item"><Bell size={18} /> <span>การแจ้งเตือน</span></div>
                    <div className="s-nav-item"><Shield size={18} /> <span>ความปลอดภัย</span></div>
                </section>

                <main className="settings-content glass shadow-2xl">
                    <div className="form-section">
                        <div className="section-title-row">
                            <h3>ข้อมูลการเชื่อมต่อ Facebook</h3>
                            <span className={`status-tag ${stats?.connections?.facebook || (config.fbPageId && config.fbPageAccessToken) ? 'active' : ''}`}>
                                {stats?.connections?.facebook || (config.fbPageId && config.fbPageAccessToken) ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
                            </span>
                        </div>
                        <p className="description">กรุณากรอกข้อมูลเพื่อใช้ในการโพสต์คอนเทนต์โดยอัตโนมัติ</p>

                        <div className="input-group">
                            <label>Facebook Page ID</label>
                            <input
                                type="text"
                                placeholder="ระบุ Page ID ของคุณ"
                                className="glass"
                                value={config.fbPageId}
                                onChange={e => setConfig({ ...config, fbPageId: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>Page Access Token</label>
                            <input
                                type="password"
                                placeholder="ระบุ Access Token"
                                className="glass"
                                value={config.fbPageAccessToken}
                                onChange={e => setConfig({ ...config, fbPageAccessToken: e.target.value })}
                            />
                        </div>

                        <div className="btn-group-row">
                            <button
                                className="btn-verify glass"
                                onClick={async () => {
                                    if (!config.fbPageId || !config.fbPageAccessToken) return alert('กรุณากรอกข้อมูลให้ครบ');
                                    try {
                                        const res = await fetch('/api/fb-verify', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ pageId: config.fbPageId, accessToken: config.fbPageAccessToken })
                                        });
                                        const data = await res.json();
                                        alert(data.message);
                                    } catch (e) {
                                        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
                                    }
                                }}
                            >
                                ตรวจสอบสิทธิ์การเข้าถึง
                            </button>
                            <button
                                className="btn-test-post glass"
                                onClick={async () => {
                                    if (!config.fbPageId || !config.fbPageAccessToken) return alert('กรุณากรอกข้อมูลให้ครบ');
                                    if (!confirm('ต้องการลองโพสต์ข้อความทดสอบลงในเพจตอนนี้เลยหรือไม่?')) return;
                                    try {
                                        const res = await fetch('/api/fb-verify', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                pageId: config.fbPageId,
                                                accessToken: config.fbPageAccessToken,
                                                testPost: true
                                            })
                                        });
                                        const data = await res.json();
                                        alert(data.message);
                                    } catch (e) {
                                        alert('เกิดข้อผิดพลาดในการทดลองโพสต์');
                                    }
                                }}
                            >
                                ทดลองโพสต์ข้อความ
                            </button>
                        </div>

                        <div className="api-info glass">
                            <Shield size={16} className="text-primary" />
                            <p>ข้อมูล API ของคุณถูกเก็บรักษาด้วยการเข้ารหัสระดับสูงในสภาพแวดล้อมที่ปลอดภัย</p>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="section-title-row">
                            <h3>การตั้งค่า AI Gemini</h3>
                            <span className={`status-tag ${stats?.connections?.gemini || config.geminiApiKey ? 'active' : ''}`}>
                                {stats?.connections?.gemini || config.geminiApiKey ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
                            </span>
                        </div>
                        <div className="input-group">
                            <label>Gemini API Key</label>
                            <input
                                type="password"
                                placeholder="ระบุ API Key ของคุณ"
                                className="glass"
                                value={config.geminiApiKey}
                                onChange={e => setConfig({ ...config, geminiApiKey: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>จำนวนสินค้าที่จะให้ AI เลือกมาวิเคราะห์ (1 - 20 ชิ้น)</label>
                            <div className="range-container">
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    step="1"
                                    className="slider"
                                    value={config.productCount}
                                    onChange={e => setConfig({ ...config, productCount: parseInt(e.target.value) })}
                                />
                                <span className="range-value">{config.productCount} ชิ้น</span>
                            </div>
                            <p className="hint text-dim">AI จะคัดเลือกสินค้าที่น่าสนใจที่สุดตามจำนวนที่ระบุเพื่อโพสต์ลงเพจ</p>
                        </div>
                    </div>
                </main>
            </div>

            <style jsx>{`
                .section-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .status-tag {
                    font-size: 0.75rem;
                    padding: 4px 12px;
                    border-radius: 20px;
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    font-weight: 600;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .status-tag.active {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    border-color: rgba(34, 197, 94, 0.2);
                }
                .settings-page { display: flex; flex-direction: column; gap: 32px; }
                .settings-grid { display: grid; grid-template-columns: 280px 1fr; gap: 32px; align-items: start; }
                .settings-nav {
                    padding: 12px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .s-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    border-radius: var(--radius-md);
                    color: var(--text-dim);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .s-nav-item:hover { background: rgba(255, 255, 255, 0.05); color: var(--foreground); }
                .s-nav-item.active { background: var(--primary); color: white; }
                .settings-content {
                    padding: 40px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--card-border);
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                }
                .form-section h3 { margin-bottom: 8px; font-size: 1.25rem; }
                .description { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 24px; }
                .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
                .input-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-dim); }
                .input-group input {
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--card-border);
                    color: white;
                    outline: none;
                }
                .input-group input:focus { border-color: var(--primary); }
                .hint { font-size: 0.75rem; margin-top: 4px; }
                
                .range-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 8px 0;
                }
                .slider {
                    flex: 1;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    appearance: none;
                    outline: none;
                }
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: var(--primary);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 10px var(--primary-glow);
                }
                .range-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--primary);
                    min-width: 60px;
                }

                .api-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    border-radius: var(--radius-md);
                    font-size: 0.8rem;
                    background: rgba(99, 102, 241, 0.05);
                    color: var(--text-dim);
                }
                
                .btn-group-row {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .btn-verify, .btn-test-post {
                    flex: 1;
                    padding: 12px;
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-test-post {
                    border-color: rgba(99, 102, 241, 0.3);
                    background: rgba(99, 102, 241, 0.05);
                }
                .btn-verify:hover, .btn-test-post:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--primary);
                }

                @media (max-width: 1024px) {
                    .settings-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
