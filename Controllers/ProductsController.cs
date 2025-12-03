using Microsoft.AspNetCore.Mvc;
using ProductManagementApi.Models;
using ProductManagementApi.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProductManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly string[] Categories = new[] { "อาหาร", "เครื่องดื่ม", "ของใช้", "เสื้อผ้า" };

        [HttpPost]
        public IActionResult AddProduct([FromBody] Product input)
        {
            var errors = new List<string>();
            if (string.IsNullOrWhiteSpace(input.Name)) errors.Add("ชื่อสินค้าต้องไม่ว่าง");
            if (string.IsNullOrWhiteSpace(input.SKU) || input.SKU.Length < 3) errors.Add("รหัสสินค้าต้องมีอย่างน้อย 3 ตัวอักษร");
            else if (ProductStore.SKUExists(input.SKU)) errors.Add("SKU ซ้ำกับสินค้าอื่น");
            if (input.Price <= 0) errors.Add("ราคาต้องมากกว่า 0");
            if (input.Stock < 0) errors.Add("สต็อกต้องไม่ติดลบ");
            if (!Categories.Contains(input.Category)) errors.Add("หมวดหมู่ไม่ถูกต้อง");

            if (errors.Count > 0) return BadRequest(new { errors });

            var newProduct = new Product
            {
                Name = input.Name,
                SKU = input.SKU,
                Price = input.Price,
                Stock = input.Stock,
                Category = input.Category
            };

            ProductStore.Add(newProduct);
            return Created("", newProduct);
        }

        [HttpGet]
        public IActionResult GetProducts([FromQuery] string category)
        {
            var products = ProductStore.GetAll();
            if (!string.IsNullOrEmpty(category))
                products = products.Where(p => p.Category == category).ToList();
            return Ok(products);
        }

        [HttpPost("sell")]
        public IActionResult SellProduct([FromBody] SellRequest request)
        {
            if (request.Quantity <= 0) return BadRequest(new { error = "Quantity ต้องมากกว่า 0" });
            var product = ProductStore.GetById(request.ProductId);
            if (product == null) return NotFound(new { error = "ไม่พบสินค้า" });
            if (product.Stock < request.Quantity) return BadRequest(new { error = "สต็อกไม่เพียงพอ" });

            product.Stock -= request.Quantity;
            return Ok(product);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            var product = ProductStore.GetById(id);
            if (product == null) return NotFound(new { error = "ไม่พบสินค้า" });

            ProductStore.GetAll().Remove(product);
            return Ok();
        }

        [HttpGet("search")]
        public IActionResult Search([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return BadRequest(new { error = "Keyword ห้ามว่าง" });
            var products = ProductStore.GetAll()
                .Where(p => p.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                         || p.SKU.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                .ToList();
            return Ok(products);
        }

        [HttpPut("bulk-price-update")]
        public IActionResult BulkPriceUpdate([FromBody] List<BulkPriceUpdateRequest> updates)
        {
            int updatedCount = 0;
            foreach (var u in updates)
            {
                var product = ProductStore.GetById(u.ProductId);
                if (product != null && u.NewPrice > 0)
                {
                    product.Price = u.NewPrice;
                    updatedCount++;
                }
            }
            return Ok(new { updatedCount });
        }
    }

    public class SellRequest { public int ProductId { get; set; } public int Quantity { get; set; } }
    public class BulkPriceUpdateRequest { public int ProductId { get; set; } public decimal NewPrice { get; set; } }
}
