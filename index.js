const mysql = require('mysql');
const colors = require('colors');
const columnify = require('columnify');
const config = require('./config');
const connection = mysql.createConnection(config);
const products = require('./app/bamazonCustomer')(connection);

connection.connect((err) => {
  if(err) throw err;
  // let threadId = `${connection.threadId}`.green
  console.log(`MySQL connection successful on thred ${connection.threadId}`.green);
});

products.getAllProducts().then((results) => {
  // console.log("We have our results", results);
  results.map((product) => {
    console.log(' WHAT IS OUR PRODUCT', product.item_id);
  })
  // var columns = columnify(results, {columns: ['ID', 'PRODUCT NAME', 'DEPARTMENT']})
  // console.log(columns)
})
