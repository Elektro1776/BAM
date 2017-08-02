var columnify = require('columnify')
// var columns = columnify(data, options)
// console.log(columns)

const products = function(dbCon) {
    const that = {};

    function getAllProducts() {
      return new Promise((resolve, reject) => {
        dbCon.query("SELECT * FROM products", function(err, results, fields) {
          if (err) reject(err);

          resolve(results);
        })
      })
    }
    function updateProduct(item) {
      const itemToUpdate = item.item_id;
      const newQtny = item.stock_quantity
      return new Promise((resolve, reject) => {
        dbCon.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [newQtny, itemToUpdate], (err, results, fields) => {
            if(err) reject(err);
            resolve(results);
        })
      })
    }
    that.getAllProducts = getAllProducts;
    that.updateProduct = updateProduct;

    return that;
}

module.exports = products;
