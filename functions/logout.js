const fs = require('fs');
const chalk = require('chalk')
const prompts = require('prompts')
module.exports = async (page, print) => {
    fs.unlinkSync('./cookies.json');
    print(chalk.red('Logged out.'))
}