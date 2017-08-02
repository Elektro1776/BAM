const inquirer = require('inquirer');

function prompt(question) {
  return inquirer.prompt([question])
}

module.exports = prompt;
