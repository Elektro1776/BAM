const mysql = require('mysql');
const colors = require('colors');
const columnify = require('columnify');
const config = require('./config');
const connection = mysql.createConnection(config);
const products = require('./app/bamazonCustomer')(connection);

connection.connect((err) => {
  if(err) throw err;
  console.log(`WELCOM TO BAMAZON!`.green);
});

products.getAllProducts().then((results) => {
  const productData = results.map((product) => {
    const { item_id, product_name, department_name, price, stock_quantity } = product;
    return ({
      item_id,
      product_name,
      department_name,
      price,
      stock_quantity,
    });
  });
  const columns = columnify(productData, {columnSplitter: ' | '});
  return Promise.resolve(columns);
}).then((productInfo) => {
    console.log(productInfo.yellow);

}).catch((err) => console.log('errrr', err))
