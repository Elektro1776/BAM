const prompt = require('./prompt');
const columnify = require('columnify');

function createColumns(data) {
  const columns = columnify(data, { columnSplitter: ' | '});
  console.log(columns.yellow);
}
const manager = (dbCon) => {
  const that = {};
  function whatToDo() {
    const managerTasks = {
      type: 'list',
      message: 'What would you like to do hot shot?'.green,
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
      name: 'toDo'
    }
    prompt(managerTasks).then((answer) => {
      switch (answer.toDo) {
        case 'View Products for Sale':
          listAllProducts().then((results) => {
            createColumns(results);
            whatToDo();
          })
          break;
        case 'View Low Inventory':
          findLowInventory().then((results) => {
            createColumns(results);
            whatToDo();
          });
          break;
        case 'Add to Inventory':
          listAllProducts().then((results) => {
            createColumns(results);
            addMoreInventory();
          });
          break;
        case 'Add New Product':
        console.log(' HIT HERE????');
          addNewInventory();
          break;
        default:
        return;
      }
    });
  };
  function listAllProducts() {
    return new Promise((resolve, reject) => {
      dbCon.query("SELECT * FROM products", (err, results, fields) => {
        if(err) reject(err);
        resolve(results);
      });
    });
  };

  function findLowInventory() {
    return new Promise((resolve, reject) => {
      dbCon.query("SELECT  product_name,stock_quantity FROM products WHERE stock_quantity < 10 GROUP BY product_name, stock_quantity", (err, results, fields) => {
        if(err) reject(err);
        resolve(results);
      });
    });
  };
  function addMoreInventory(){
    const whatItemsToAdd = {
      type: 'input',
      message: 'Which item would you like to add more of? Please enter the item_id.'.green,
      name: 'item_id',
    };
    const howMuchInventoryToAdd = {
      type: 'input',
      message: 'What is the quantity of items you would like to add?'.green,
      name: 'qtny',
    };
    prompt(whatItemsToAdd).then((answer) => {
      prompt(howMuchInventoryToAdd).then((quantity) => {
        const item_id = parseInt(answer.item_id, 10);
        const qtny = parseInt(quantity.qtny, 10);
          dbCon.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?", [qtny, item_id], (err, results, fields) => {
            if (err) console.log(err);
            listAllProducts().then((results) => {
              createColumns(results);
              whatToDo();
            });
          });
      });
    });
  };
  function addNewInventory() {
    const whatItemToAdd = {
      type: 'input',
      message: 'Please enter the product_name, department_name, price, and stock_quantity.\n Separate by white space or commas please!'.green,
      name: 'item',
    };
    prompt(whatItemToAdd).then((answer) => {
      let newItemData;
      if (answer.item.indexOf(',') === -1) {
         newItemData = answer.item.split(' ');
      } else {
         newItemData = answer.item.split(',');
      }
      const newItem = {
        product_name: newItemData[0],
        department_name: newItemData[1],
        price: parseInt(newItemData[2],10),
        stock_quantity: parseInt(newItemData[3], 10),
      }
      console.log(' WHAT I SOUR NEW ITEM ', typeof newItem.stock_quantity, newItemData[3], typeof newItemData[3]);
      dbCon.query('INSERT INTO products Set ?', newItem, (err, results, fields) => {
        if(err) throw new Error(err);
        // console.log(' WHAT ARE THE REUSLTS???', results);
        listAllProducts().then((results) => {
          createColumns(results);
          whatToDo();
        })
      })
    });

  }
  that.whatToDo = whatToDo;

  return that;
}

module.exports = manager;
