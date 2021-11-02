const fs = require('fs');
const chalk = require('chalk')
const prompts = require('prompts')
module.exports = async (page, print) => {
    await page.goto('https://www.tiktok.com');
    print(chalk.green('[+]') + ' Enjoy surfing.')
}