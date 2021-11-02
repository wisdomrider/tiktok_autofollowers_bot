#!/usr/bin/env node
const puppeteer = require('puppeteer-extra')
const follow_streamer = require('./follow_streamer')
const fs = require('fs');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const chalk = require('chalk')
const prompts = require('prompts')
puppeteer.use(StealthPlugin())
let cookies;

// puppeteer usage as normal

const cookieExists = fs.existsSync('./cookies.json');
const print = (data) => console.log(data)
let third;
try { third = process.argv[2] } catch (e) { third = null }
const headLess = process.argv.join(' ').includes('-HL');
if (cookieExists) {
    cookies = fs.readFileSync('./cookies.json', 'utf8');
    cookies = JSON.parse(cookies);
    // await page.setCookie(...cookies);
    const line = "------------------------";
    print(chalk.bold.green(line + '\n[*] Bot by @wisdomrider\n' + line))
    print(chalk.redBright("[!] I will not be responsible if anything happens to your account or you do anything using this bot.\n[!] This bot is made for only educational purpose.\n[!] After following 100-300 accounts tiktok blocks you then wait for 1-3 hr and try again.\n[!] To change streamer's username change the last.txt file\n[!] Time when you were blocked is saved in last_block.txt\n" + line))
    print(chalk.yellowBright(`[!] Other options\n[~] use --unfollow to unfollow users who have not followed you.\n[~] use --unfollow_1 if first doesnot work for you.\n[~] use --logout to logout\n[~] use --surf to surf\n[~] use -HL for headless\n${line}`))
    print(chalk.bold.greenBright(line + '\n[*] If you find this bot helpful then buy me a cup of coffee from here\nhttps://www.paypal.com/donate?hosted_button_id=6NL4SUDP5C9BY\n' + line))
    print(chalk.yellow("[=] Cookies loaded.\n"))
}
else {
    print(chalk.bold.red("[x] Cookies not found. Login to your tiktok account then press y to proceed."))
}

puppeteer.launch({ headless: headLess }).then(async browser => {
    const page = await browser.newPage()
    if (!cookieExists) {
        await page.goto("https://www.tiktok.com")
        //promts
        const response = await prompts({
            type: 'confirm',
            name: 'resp',
            message: 'Login to your tiktok account then press y to proceed.',
        })
        if (response.resp) {
            //save cookies
            cookies = await page.cookies();
            fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));
            await browser.close();
            print(chalk.green("Cookies saved successfully.Start the process again to begin."))
            return;
        }

    }
    await page.setCookie(...cookies);
    if (!third) await follow_streamer(page, print)
    else {
        try {
            let file = require('./functions/' + third.replace(/-/g, ""))
            await file(page, print)
        }
        catch (e) {
            console.log(e);
            print(chalk.bold.red("Invalid command."))
            require("process").exit(1)
        }
    }
})