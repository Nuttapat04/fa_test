using ProductManagementApi.Models;
using System.Collections.Generic;
using System.Linq;

namespace ProductManagementApi.Data
{
    public static class ProductStore
    {
        private static List<Product> _products = new List<Product>();
        private static int _nextId = 1;

        public static List<Product> GetAll() => _products;

        public static Product Add(Product p)
        {
            p.Id = _nextId++;
            p.CreatedAt = DateTime.UtcNow;
            _products.Add(p);
            return p;
        }

        public static Product GetById(int id) => _products.FirstOrDefault(p => p.Id == id);

        public static bool SKUExists(string sku) => _products.Any(p => p.SKU.ToLower() == sku.ToLower());
    }
}
