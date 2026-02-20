'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    ExternalLink,
    ShoppingBag,
    X,
    Check,
    Upload,
    FileText,
    Loader2
} from 'lucide-react';
import Papa from 'papaparse';

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('all'); // all, hottest, new
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        affiliateLink: '',
        sales: '0'
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price.toString(),
                affiliateLink: product.affiliateLink,
                sales: product.sales.toString()
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                price: '',
                affiliateLink: '',
                sales: '0'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
        const method = editingProduct ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                handleCloseModal();
                fetchProducts();
            }
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const parseThaiAmount = (val: string) => {
        if (!val) return 0;
        let clean = val.replace('฿', '').replace(',', '').replace('+', '').trim();
        if (clean.includes('พัน')) {
            return parseFloat(clean.replace('พัน', '')) * 1000;
        }
        if (clean.includes('หมื่น')) {
            return parseFloat(clean.replace('หมื่น', '')) * 10000;
        }
        if (clean.includes('แสน')) {
            return parseFloat(clean.replace('แสน', '')) * 100000;
        }
        if (clean.includes('ล้าน')) {
            return parseFloat(clean.replace('ล้าน', '')) * 1000000;
        }
        return parseFloat(clean) || 0;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results: Papa.ParseResult<any>) => {
                const rawData = results.data;
                const mappedProducts = rawData.map((row: any) => ({
                    name: row['ชื่อสินค้า'] || '',
                    price: parseThaiAmount(row['ราคา'] || '0').toString(),
                    sales: parseThaiAmount(row['ขาย'] || '0').toString(),
                    category: row['ชื่อร้านค้า'] || 'ทั่วไป',
                    affiliateLink: row['ลิงก์ข้อเสนอ'] || row['ลิงก์สินค้า'] || ''
                })).filter((p: any) => p.name && p.affiliateLink);

                if (mappedProducts.length === 0) {
                    alert('ไม่พบข้อมูลสินค้าที่ถูกต้องในไฟล์');
                    setIsImporting(false);
                    return;
                }

                try {
                    const res = await fetch('/api/products/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: mappedProducts })
                    });

                    if (res.ok) {
                        alert(`นำเข้าสินค้าสำเร็จ ${mappedProducts.length} รายการ`);
                        fetchProducts();
                    } else {
                        alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
                } finally {
                    setIsImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            }
        });
    };

    const filteredProducts = products
        .filter(p =>
            (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (p.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )
        .filter(p => {
            if (viewMode === 'hottest') return parseInt(p.sales?.replace(/[^0-9]/g, '') || '0') > 5000;
            if (viewMode === 'new') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(p.createdAt) > oneWeekAgo;
            }
            return true;
        });

    // Reset pagination when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, viewMode]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="products-page animate-fade-in">
            <header className="page-header">
                <div className="title-area">
                    <h1>สินค้า <span className="gradient-text">ในคลัง</span></h1>
                    <p className="text-dim">จัดการสินค้าและลิงก์ Affiliate สำหรับการเลือกโดย AI</p>
                </div>
                <div className="header-actions">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".csv"
                        onChange={handleFileUpload}
                    />
                    <button
                        className={`btn-secondary glass ${isImporting ? 'loading' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                    >
                        {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        <span>{isImporting ? 'กำลังนำเข้า...' : 'นำเข้า CSV'}</span>
                    </button>
                    <button className="btn-primary glass hover-glow" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>เพิ่มสินค้า</span>
                    </button>
                </div>
            </header>

            <section className="table-controls glass">
                <div className="search-bar glass">
                    <Search size={18} className="text-dim" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <button className="filter-btn glass" onClick={() => alert('ตัวกรองขั้นสูงกำลังพัฒนา')}>
                        <Filter size={18} />
                        <span>กรอง</span>
                    </button>
                    <div className="view-toggle glass">
                        <div
                            className={`toggle-item ${viewMode === 'all' ? 'active' : ''}`}
                            onClick={() => setViewMode('all')}
                        >ทั้งหมด</div>
                        <div
                            className={`toggle-item ${viewMode === 'hottest' ? 'active' : ''}`}
                            onClick={() => setViewMode('hottest')}
                        >ยอดนิยม</div>
                        <div
                            className={`toggle-item ${viewMode === 'new' ? 'active' : ''}`}
                            onClick={() => setViewMode('new')}
                        >ใหม่</div>
                    </div>
                </div>
            </section>

            <div className="table-container glass">
                {loading ? (
                    <div className="loading-state">
                        <div className="3d-spinner mb-4 flex items-center justify-center relative w-20 h-20">
                            <svg className="progress-3d-spinner absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="gradSpinner" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--primary)" />
                                        <stop offset="100%" stopColor="var(--accent)" />
                                    </linearGradient>
                                    <filter id="glowSpinner">
                                        <feGaussianBlur stdDeviation="2" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <circle cx="50" cy="50" r="40" className="bg" />
                                <circle cx="50" cy="50" r="40" className="bar spin-loader" />
                            </svg>
                            <ShoppingBag size={24} className="text-primary animate-pulse relative z-10" />
                        </div>
                        <p className="gradient-text font-bold">กำลังซิงค์ข้อมูลจากคลัง 3D...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="loading-state">ไม่พบสินค้าที่ตรงตามเงื่อนไข</div>
                ) : (
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>รายละเอียดสินค้า</th>
                                <th>หมวดหมู่</th>
                                <th>ราคา</th>
                                <th>ยอดขาย</th>
                                <th>สถานะ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map((product: any) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-info-cell">
                                            <div className="product-icon glass">
                                                <ShoppingBag size={20} className="gradient-text" />
                                            </div>
                                            <div>
                                                <p className="product-name">{product.name}</p>
                                                <a href={product.affiliateLink} target="_blank" className="affiliate-link">
                                                    ลิงก์ <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge glass">{product.category}</span></td>
                                    <td className="font-semibold">฿{product.price}</td>
                                    <td><span className="sales-highlight">{product.sales}</span></td>
                                    <td><span className="status-indicator active">ใช้งานอยู่</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="icon-btn glass" onClick={() => handleOpenModal(product)}><Edit size={16} /></button>
                                            <button className="icon-btn delete glass" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
                                            <button className="icon-btn glass"><MoreVertical size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {filteredProducts.length > itemsPerPage && !loading && (
                    <div className="pagination">
                        <button
                            className="page-btn glass"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            ก่อนหน้า
                        </button>
                        <span className="page-info">หน้าที่ {currentPage} จาก {totalPages}</span>
                        <button
                            className="page-btn glass"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            ถัดไป
                        </button>
                    </div>
                )}
            </div>

            {/* CRUD Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>ชื่อสินค้า</label>
                                    <input
                                        type="text"
                                        required
                                        className="modal-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>หมวดหมู่</label>
                                    <input
                                        type="text"
                                        required
                                        className="modal-input"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>ราคา (บาท)</label>
                                    <input
                                        type="text"
                                        required
                                        className="modal-input"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Affiliate Link</label>
                                    <input
                                        type="url"
                                        required
                                        className="modal-input"
                                        value={formData.affiliateLink}
                                        onChange={e => setFormData({ ...formData, affiliateLink: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>ยกเลิก</button>
                                <button type="submit" className="btn-primary">
                                    <Check size={18} />
                                    <span>{editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .products-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
        }

        .header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .table-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 28px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--card-border);
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          width: 400px;
          border: 1px solid var(--card-border);
          transition: all 0.3s;
        }

        .search-bar:focus-within {
            border-color: var(--primary);
            box-shadow: 0 0 15px var(--primary-glow);
        }

        .search-bar input {
          background: none;
          border: none;
          color: white;
          width: 100%;
          outline: none;
          font-size: 0.95rem;
        }

        .filter-group {
          display: flex;
          gap: 16px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .view-toggle {
          display: flex;
          padding: 6px;
          border-radius: var(--radius-md);
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
        }

        .toggle-item {
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-dim);
          min-width: 80px;
          text-align: center;
        }

        .toggle-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .table-container {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--card-border);
          box-shadow: var(--shadow-soft);
        }

        .product-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .product-table th {
          padding: 24px;
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-dim);
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid var(--card-border);
        }

        .product-table td {
          padding: 24px;
          border-bottom: 1px solid var(--card-border);
          vertical-align: middle;
          transition: all 0.2s;
        }

        .product-table tr:last-child td {
            border-bottom: none;
        }

        .product-table tr:hover td {
            background: rgba(255, 255, 255, 0.01);
        }

        .product-info-cell {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px;
          gap: 20px;
          border-top: 1px solid var(--card-border);
        }

        .page-btn {
          padding: 10px 20px;
          border-radius: var(--radius-md);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-btn:not(:disabled):hover {
          background: var(--primary);
        }

        .page-info {
          color: var(--text-dim);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .product-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-name {
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 1rem;
        }

        .affiliate-link {
          font-size: 0.8rem;
          color: var(--primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .affiliate-link:hover {
            text-decoration: underline;
        }

        .badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.05);
        }

        .sales-highlight {
          color: var(--accent);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 20px;
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
          width: fit-content;
        }

        .status-indicator::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 10px #4ade80;
        }

        .action-btns {
          display: flex;
          gap: 10px;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-dim);
        }

        .icon-btn:hover {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px var(--primary-glow);
          transform: translateY(-2px);
        }

        .icon-btn.delete:hover {
          background: #ef4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .loading-state {
            padding: 100px;
            text-align: center;
            color: var(--text-dim);
            display: flex;
            flex-direction: column;
            align-items: center;
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
            stroke: url(#gradSpinner);
            stroke-dasharray: 251.2;
            filter: url(#glowSpinner);
            transform-origin: 50% 50%;
            transform: rotate(-90deg);
        }

        .spin-loader {
            animation: drawSpinner 2s ease-in-out infinite alternate, spin3Dloader 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes spin3Dloader { 100% { transform: rotate(270deg); } }
        @keyframes drawSpinner { 0% { stroke-dashoffset: 251.2; } 100% { stroke-dashoffset: 40; } }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: grid;
            place-items: center;
            z-index: 999999;
            padding: 20px;
        }

        .modal-content {
            background: #252529; /* Lighter than background to be visible */
            border: 1px solid rgba(255, 255, 255, 0.2);
            width: 100%;
            max-width: 550px;
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 0 50px rgba(0,0,0,1);
            color: white;
            position: relative;
            margin: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .close-btn {
            background: none;
            border: none;
            color: var(--text-dim);
            cursor: pointer;
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .input-group:nth-child(4) {
            grid-column: span 2;
        }

        .input-group label {
            font-size: 0.85rem;
            color: var(--text-dim);
            margin-bottom: 8px;
            display: block;
        }

        .modal-input {
            width: 100%;
            padding: 14px 18px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            outline: none;
            transition: all 0.3s;
        }

        .modal-input:focus {
            border-color: var(--primary);
            background: rgba(255, 255, 255, 0.06);
            box-shadow: 0 0 15px var(--primary-glow);
        }

        .modal-actions {
            display: flex;
            gap: 16px;
            justify-content: flex-end;
            margin-top: 20px;
        }

        .btn-secondary {
            padding: 12px 24px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.02);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .btn-secondary.loading {
            opacity: 0.7;
            cursor: wait;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin {
            animation: spin 1s linear infinite;
        }

        @media (max-width: 1024px) {
            .table-controls {
                flex-direction: column;
                align-items: stretch;
                gap: 20px;
                padding: 16px;
            }
            .search-bar {
                width: 100%;
            }
            .filter-group {
                flex-direction: column;
            }
            .product-table th:nth-child(2),
            .product-table td:nth-child(2),
            .product-table th:nth-child(5),
            .product-table td:nth-child(5) {
                display: none;
            }
            .modal-content {
                padding: 24px;
                max-width: 95vw;
            }
            .form-grid {
                grid-template-columns: 1fr;
            }
            .input-group:nth-child(4) {
                grid-column: span 1;
            }
        }

        @media (max-width: 768px) {
            .product-table th:nth-child(3),
            .product-table td:nth-child(3) {
                display: none;
            }
            .product-info-cell {
                gap: 12px;
            }
            .product-icon {
                width: 36px;
                height: 36px;
            }
            .product-name {
                font-size: 0.9rem;
            }
        }
      `}</style>
        </div>
    );
}
