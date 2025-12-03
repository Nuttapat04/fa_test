import React, { useState, useMemo } from "react";

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} sku
 * @property {number} price
 * @property {number} stock
 * @property {string} category
 * @property {string} createdAt
 */

export default function ProductList() {
  const categories = ["ทั้งหมด", "อาหาร", "เครื่องดื่ม", "ของใช้", "เสื้อผ้า"]; 

  const initialProducts = [
    { id: "1", name: "ข้าวผัด", sku: "FO-001", price: 45, stock: 20, category: "อาหาร", createdAt: "2025-01-01" },
    { id: "2", name: "น้ำส้ม", sku: "DR-001", price: 25, stock: 50, category: "เครื่องดื่ม", createdAt: "2025-01-02" },
    { id: "3", name: "สบู่", sku: "UT-001", price: 35, stock: 0, category: "ของใช้", createdAt: "2025-01-03" },
    { id: "4", name: "เสื้อยืด", sku: "CL-001", price: 299, stock: 5, category: "เสื้อผ้า", createdAt: "2025-01-04" }
  ];

  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

  // Filtering
  function getFilteredProducts() {
    if (selectedCategory === "ทั้งหมด") return products;
    return products.filter((p) => p.category === selectedCategory);
  }

  const filtered = getFilteredProducts();

  // Summary
  const totalValue = filtered.reduce((sum, p) => sum + p.price * p.stock, 0);

  // Sell Product
  const handleSell = (id) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          if (p.stock <= 0) {
            alert("ขายไม่ได้: สินค้าหมด");
            return p;
          }
          alert(`ขาย 1 ชิ้นของ ${p.name} สำเร็จ`);
          return { ...p, stock: p.stock - 1 };
        }
        return p;
      })
    );
  };

  // ------------------------------------
  // Add Product Form
  // ------------------------------------
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

  const isFormValid = Object.keys(errors).length === 0 && name && sku && price && stock;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const newProduct = {
      id: String(Date.now()),
      name: name.trim(),
      sku: sku.trim(),
      price: Number(price),
      stock: Number(stock),
      category,
      createdAt: new Date().toISOString()
    };

    setProducts((prev) => [newProduct, ...prev]);

    setName('');
    setSku('');
    setPrice('');
    setStock('');
    setCategory('อาหาร');

    alert('เพิ่มสินค้าเรียบร้อย');
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1>ระบบจัดการสินค้า (Product Management)</h1>

      {/* Category Filter */}
      <div style={{ marginBottom: 15 }}>
        <label>เลือกหมวดหมู่: </label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #333" }}>
        <thead>
          <tr style={{ background: "#4caf50", color: "white" }}>
            <th style={th}>SKU</th>
            <th style={th}>ชื่อสินค้า</th>
            <th style={th}>หมวดหมู่</th>
            <th style={th}>ราคา</th>
            <th style={th}>สต็อก</th>
            <th style={th}>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} style={{ background: p.stock === 0 ? "#ffebee" : "white" }}>
              <td style={td}>{p.sku}</td>
              <td style={td}>{p.name}</td>
              <td style={td}>{p.category}</td>
              <td style={td}>{p.price.toFixed(2)}</td>
              <td style={{ ...td, color: p.stock < 10 ? "red" : "black", fontWeight: p.stock < 10 ? "bold" : "normal" }}>
                {p.stock}
              </td>
              <td style={td}>
                <button onClick={() => handleSell(p.id)} disabled={p.stock === 0}>ขาย</button>
                <button style={{ marginLeft: 6 }} onClick={() => setProducts(prev => prev.filter(pp => pp.id !== p.id))}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ marginTop: 20 }}>
        <p>จำนวนสินค้าที่แสดง: {filtered.length} รายการ</p>
        <p>มูลค่ารวมสินค้า: {totalValue.toLocaleString()} บาท</p>
      </div>

      {/* Add Product Form */}
      <form onSubmit={handleAdd} style={{ marginTop: 20, border: "1px solid #ccc", padding: 15, borderRadius: 8 }}>
        <h3>เพิ่มสินค้าใหม่</h3>

        <div style={formGrid}>
          <div>
            <label>ชื่อสินค้า</label><br />
            <input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <div style={err}>{errors.name}</div>}
          </div>

          <div>
            <label>SKU</label><br />
            <input value={sku} onChange={(e) => setSku(e.target.value)} />
            {errors.sku && <div style={err}>{errors.sku}</div>}
          </div>

          <div>
            <label>ราคา</label><br />
            <input value={price} onChange={(e) => setPrice(e.target.value)} />
            {errors.price && <div style={err}>{errors.price}</div>}
          </div>

          <div>
            <label>สต็อก</label><br />
            <input value={stock} onChange={(e) => setStock(e.target.value)} />
            {errors.stock && <div style={err}>{errors.stock}</div>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label>หมวดหมู่</label><br />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="อาหาร">อาหาร</option>
              <option value="เครื่องดื่ม">เครื่องดื่ม</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
            {errors.category && <div style={err}>{errors.category}</div>}
          </div>
        </div>

        <button type="submit">เพิ่มสินค้า</button>
      </form>
    </div>
  );
}