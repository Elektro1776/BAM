const mysql = require('mysql');
const colors = require('colors');
const columnify = require('columnify');
const config = require('./config');
const prompt = require('./app/prompt');
const connection = mysql.createConnection(config);
const products = require('./app/bamazonCustomer')(connection);

connection.connect((err) => {
  if(err) throw err;
  console.log(`WELCOME TO BAMAZON!`.green);
});
// KICK THINGS OF FROM HERE!
// lets show our user our sweet bamazon store
const Bam = function (){
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
    console.log(columns.yellow);
    return Promise.resolve(productData);
  }).then((allProductInfo) => {
    return promptForCustomerChoice(allProductInfo);

  }).catch((err) => console.log('errrr', err))
};
Bam();
function promptForCustomerChoice(allProductInfo) {
  const askUserForProduct = {
    type: 'input',
    message: 'What item would you like to purchase? Please Enter ITEM_ID...',
    name: 'item_id',
  };
  prompt(askUserForProduct).then((product) => {
    product.item_id = parseInt(product.item_id, 10)
    if (product.item_id === '' || isNaN(product.item_id) || product.item_id > 10 ) {
      throw new Error("Please enter a correct ITEM_ID");
    }
    return promptForCustomerQtny(product, allProductInfo);
  }).catch((err) => {
     console.log(err.toString().red);
     promptForCustomerChoice(allProductInfo);
    })
}
function promptForCustomerQtny(product, allProductInfo) {
    const askUserForQtny = {
        type: 'input',
        message: `How many items would you like to purchase?`,
        name: 'customerQtny',
    };
    prompt(askUserForQtny).then((qtny) => {
      qtny.customerQtny = parseInt(qtny.customerQtny, 10)
      return checkForAvailableQtny(product, qtny, allProductInfo);
    }).catch((err) => console.warn(err))
}
function checkForAvailableQtny({ item_id }, { customerQtny }, allProductInfo) {
  let avaiableProduct = allProductInfo.filter((item) => {
    if (item.item_id === item_id) {
      if(item.stock_quantity >= customerQtny) {
         item.stock_quantity = item.stock_quantity - customerQtny;
        return completeCustomerTransaction(item, customerQtny);
      }
      return insufficentQtny(item);
    }
  });
}
function completeCustomerTransaction(item, customerQtny) {
  let totalSale = customerQtny * item.price;
  products.updateProduct(item).then((result) => {
    console.group();
    console.log(`THANK YOU FOR YOUR PURCHASE! YOUR TOTAL COMES TO $${totalSale}.00`.green);
    console.log(' PLEASE FEEL FREE TO BROWSE AROUND SOME MORE!'.green);
    Bam();
    console.endGroup();
  }).catch((err) => new Error("Looks like there was a problem making your tranasaction", err));
}
function insufficentQtny(product) {
  if (product.product_name === 'fucks') {
    return (
      console.group(),
      console.log(`Looks like there are no more ${product.product_name.toUpperCase()} to give today...\n`.red),
      console.groupEnd(),
      console.group(),
      console.log(`Please try entering a lower quantity.`.green),
      console.groupEnd(),
      Bam()
    );
  }
  console.group();
  console.log(`Sorry Looks like ther is insuffecient quantity for ${product.product_name.toUpperCase()}\n`.red),
  console.log(`Please try entering a lower quantity.`.green),
  console.groupEnd();
  Bam();
}
