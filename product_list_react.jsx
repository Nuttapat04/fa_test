import React, { useState, useEffect, useMemo } from "react";

export default function ProductList() {
  const categories = ["ทั้งหมด", "อาหาร", "เครื่องดื่ม", "ของใช้", "เสื้อผ้า"];

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

  // ---------------- Fetch Products ----------------
  const fetchProducts = async () => {
    let url = "/api/products";
    if (selectedCategory !== "ทั้งหมด") url += `?category=${selectedCategory}`;
    const res = await fetch(url);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  // ---------------- Sell Product ----------------
  const handleSell = async (id) => {
    const res = await fetch("/api/products/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, quantity: 1 }),
    });
    if (res.ok) {
      const updatedProduct = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      alert("ขายสำเร็จ");
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  // ---------------- Delete Product ----------------
  const handleDelete = async (id) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("ลบสินค้าเรียบร้อย");
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  // ---------------- Add Product Form ----------------
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("อาหาร");

  const errors = useMemo(() => {
    const e = {};
    if (name.trim().length < 3) e.name = "ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร";
    if (!sku.trim()) e.sku = "SKU ห้ามว่าง";
    const pr = Number(price);
    if (Number.isNaN(pr) || pr <= 0) e.price = "ราคาต้องเป็นตัวเลขและมากกว่า 0";
    const st = Number(stock);
    if (!Number.isInteger(st) || st < 0) e.stock = "สต็อกต้องเป็นจำนวนเต็ม >= 0";
    return e;
  }, [name, sku, price, stock]);

  const isFormValid = Object.keys(errors).length === 0 && name && sku && price && stock;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const newProduct = { name: name.trim(), sku: sku.trim(), price: Number(price), stock: Number(stock), category };
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    if (res.ok) {
      const savedProduct = await res.json();
      setProducts((prev) => [savedProduct, ...prev]);
      setName(""); setSku(""); setPrice(""); setStock(""); setCategory("อาหาร");
      alert("เพิ่มสินค้าเรียบร้อย");
    } else {
      const err = await res.json();
      alert(err.errors.join("\n"));
    }
  };

  // ---------------- Summary ----------------
  const filtered = selectedCategory === "ทั้งหมด" ? products : products.filter((p) => p.category === selectedCategory);
  const totalValue = filtered.reduce((sum, p) => sum + p.price * p.stock, 0);

  // ---------------- Styles ----------------
  const th = { border: "1px solid #333", padding: "8px", textAlign: "left" };
  const td = { border: "1px solid #333", padding: "8px" };
  const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 };
  const err = { color: "red", fontSize: 12 };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <h1>ระบบจัดการสินค้า (Product Management)</h1>

      {/* Category Filter */}
      <div style={{ marginBottom: 15 }}>
        <label>เลือกหมวดหมู่: </label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
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
              <td style={{ ...td, color: p.stock < 10 ? "red" : "black", fontWeight: p.stock < 10 ? "bold" : "normal" }}>{p.stock}</td>
              <td style={td}>
                <button onClick={() => handleSell(p.id)} disabled={p.stock === 0}>ขาย</button>
                <button style={{ marginLeft: 6 }} onClick={() => handleDelete(p.id)}>ลบ</button>
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
              {categories.slice(1).map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>
        <button type="submit" style={{ marginTop: 10 }}>เพิ่มสินค้า</button>
      </form>
    </div>
  );
}
