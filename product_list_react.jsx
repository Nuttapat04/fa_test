import React, { useMemo, useState } from 'react';

// Product Management (HTML React / JavaScript) — ครบทุกฟีเจอร์ตามที่ร้องขอ

export default function ProductList() {
  // ---- types (JS version) ----
  const categories = ['ทั้งหมด', 'อาหาร', 'เครื่องดื่ม', 'ของใช้', 'เสื้อผ้า'];

  // ---- mock data ----
  const initialProducts = [
    { id: 'p1', name: 'ข้าวผัด', sku: 'FD-001', price: 45, stock: 20, category: 'อาหาร', createdAt: new Date().toISOString() },
    { id: 'p2', name: 'น้ำส้ม', sku: 'DR-001', price: 25, stock: 50, category: 'เครื่องดื่ม', createdAt: new Date().toISOString() },
    { id: 'p3', name: 'สบู่', sku: 'UT-001', price: 35, stock: 0, category: 'ของใช้', createdAt: new Date().toISOString() },
    { id: 'p4', name: 'เสื้อยืด', sku: 'CL-001', price: 299, stock: 5, category: 'เสื้อผ้า', createdAt: new Date().toISOString() },
    { id: 'p5', name: 'ขนมหวาน', sku: 'FD-002', price: 30.5, stock: 8, category: 'อาหาร', createdAt: new Date().toISOString() },
  ];

  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  // ---- currency ----
  const currency = (v) => {
    try {
      return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(v);
    } catch (e) {
      return `฿${v.toFixed(2)}`;
    }
  };

  // ---- filter ----
  function getFilteredProducts() {
    if (selectedCategory === 'ทั้งหมด') return products;
    return products.filter((p) => p.category === selectedCategory);
  }

  const filtered = useMemo(() => getFilteredProducts(), [products, selectedCategory]);

  const totalCount = filtered.length;
  const totalValue = filtered.reduce((s, p) => s + p.price * p.stock, 0);

  // ---- Sell ----
  const handleSell = (sku) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.sku === sku);
      if (idx === -1) {
        window.alert('ไม่พบสินค้า');
        return prev;
      }
      const prod = prev[idx];
      if (prod.stock <= 0) {
        window.alert('สินค้าหมด ไม่สามารถขายได้');
        return prev;
      }
      const next = [...prev];
      next[idx] = { ...prod, stock: prod.stock - 1 };
      window.alert(`ขายสินค้า ${prod.name} สำเร็จ (คงเหลือ ${prod.stock - 1})`);
      return next;
    });
  };

  // ---- add product form ----
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('อาหาร');

  const errors = useMemo(() => {
    const e = {};
    if (name.trim().length < 3) e.name = 'ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร';
    if (!sku.trim()) e.sku = 'SKU ห้ามว่าง';
    else if (products.some((p) => p.sku.toLowerCase() === sku.trim().toLowerCase())) e.sku = 'SKU ซ้ำกับสินค้าอื่น';
    const pr = Number(price);
    if (Number.isNaN(pr) || pr <= 0) e.price = 'ราคาต้องเป็นตัวเลขและมากกว่า 0';
    const st = Number(stock);
    if (!Number.isInteger(st) || st < 0) e.stock = 'สต็อกต้องเป็นจำนวนเต็ม >= 0';
    return e;
  }, [name, sku, price, stock, products]);

  const isFormValid =
    Object.keys(errors).length === 0 &&
    name.trim() !== '' &&
    sku.trim() !== '' &&
    price !== '' &&
    stock !== '';

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const newProduct = {
      id: `p_${Date.now()}`,
      name: name.trim(),
      sku: sku.trim(),
      price: Number(price),
      stock: Number(stock),
      category,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProduct, ...prev]);

    // clear form
    setName('');
    setSku('');
    setPrice('');
    setStock('');
    setCategory('อาหาร');
    window.alert('เพิ่มสินค้าเรียบร้อย');
  };

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 1000, margin: '0 auto' }}>
      <h2>ระบบจัดการสินค้า (Product Management)</h2>

      {/* Filter */}
      <div style={{ margin: '12px 0', display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>
          หมวดหมู่:{' '}
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ background: '#2f9e44', color: 'white' }}>
              <th style={thStyle}>SKU</th>
              <th style={thStyle}>ชื่อสินค้า</th>
              <th style={thStyle}>หมวดหมู่</th>
              <th style={thStyle}>ราคา</th>
              <th style={thStyle}>สต็อก</th>
              <th style={thStyle}>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isOut = p.stock === 0;
              const lowStock = p.stock > 0 && p.stock < 10;
              return (
                <tr key={p.id} style={{ background: isOut ? '#ffdede' : undefined }}>
                  <td style={tdStyle}>{p.sku}</td>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.category}</td>
                  <td style={tdStyle}>{currency(p.price)}</td>
                  <td style={tdStyle}>
                    <span style={lowStock ? { color: 'red', fontWeight: 700 } : undefined}>{p.stock}</span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleSell(p.sku)} disabled={p.stock === 0} style={{ marginRight: 8 }}>
                      ขาย
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`ต้องการลบ ${p.name} หรือไม่?`)) {
                          setProducts((prev) => prev.filter((x) => x.sku !== p.sku));
                        }
                      }}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
        <div>
          สินค้าที่แสดง: <strong>{totalCount}</strong>
        </div>
        <div>
          มูลค่ารวม (รวมรายการที่แสดง): <strong>{currency(totalValue)}</strong>
        </div>
      </div>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
        <h3>เพิ่มสินค้าใหม่</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>ชื่อสินค้า</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <div style={{ color: 'red', fontSize: 12 }}>{errors.name}</div>}
          </div>

          <div>
            <label>SKU</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} />
            {errors.sku && <div style={{ color: 'red', fontSize: 12 }}>{errors.sku}</div>}
          </div>

          <div>
            <label>ราคา (บาท)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} />
            {errors.price && <div style={{ color: 'red', fontSize: 12 }}>{errors.price}</div>}
          </div>

          <div>
            <label>สต็อก</label>
            <input value={stock} onChange={(e) => setStock(e.target.value)} />
            {errors.stock && <div style={{ color: 'red', fontSize: 12 }}>{errors.stock}</div>}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>หมวดหมู่</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="อาหาร">อาหาร</option>
              <option value="เครื่องดื่ม">เครื่องดื่ม</option>
              <option value="ของใช้">ของใช้</option>
              <option value="เสื้อผ้า">เสื้อผ้า