const fs = require('fs');
const chalk = require('chalk')
const prompts = require('prompts')
module.exports = async (page, print) => {
    let followCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const selectors = [
        ".webcast-chatroom-message-item",
        ".user-card-body-operations>button",
        ".user-card-header-close"
    ]
    let streamer;
    async function chooseStreamer(skip = false) {
        if (!fs.existsSync("./last.txt")) fs.writeFileSync("./last.txt", "")
        let last = fs.readFileSync('./last.txt', 'utf-8');
        if (!skip)
            streamer = await prompts({
                type: 'text',
                name: 'streamer',
                message: `Enter the streamer username who is streaming currently.You can get it from streamer\'s profile.(${last}):`,
            })
        else streamer = { streamer: last }
        if (!streamer.streamer || streamer.streamer === "") streamer = { streamer: last };
        await page.goto(`https://www.tiktok.com/@${streamer.streamer}/live?lang=en`, { timeout: 120000 })
        print(chalk.green(`[🌐] Fetching data for ${streamer.streamer} `))
        let liveEnded = await page.$(".live-end")
        let liveEnded1 = await page.$(".tiktok-toast")
        let notFound = await page.$(".not-found")
        if (liveEnded || liveEnded1 || notFound) {
            print(chalk.bold.red("[x] The streamer is not streaming currently."))
            const response = await prompts({
                type: 'confirm',
                name: 'resp',
                message: 'Go to a live stream and type y to continue..',
            })
            if (!response.resp) {
                print(chalk.bold.red("[x] Try again."))
                process.exit()
            }

        }
    }
    await chooseStreamer(true)
    await page.waitForSelector(selectors[0], { timeout: 999999 })
    //user-uniqueId
    let userId = await page.evaluate(() => document.querySelector(".user-uniqueId").innerText)
    print(chalk.green(`\n[✔] Got into the live of ${userId}`))
    fs.writeFileSync('./last.txt', userId);
    let time = 3;
    async function doIt() {
        if (errorCount > 12) {
            console.log(chalk.red("[!] Too many errors. Rerun the process."))
            require("process").exit(1);
        }
        try {
            await page.waitForTimeout(1500)
            let blockedToFollow = await page.$(".tiktok-toast")
            if (blockedToFollow) {
                let text = await page.evaluate((d) => d.innerText, blockedToFollow);
                console.log(text);
                if (text.toLowerCase().includes("too many follow requests".toLowerCase())) {
                    fs.writeFileSync("last_block.txt", new Date().toLocaleString().toString());
                    print(chalk.bold.red("[x] Tiktok blocked you to follow others. Please run the tool after 4-6 hr."))
                    require("process").exit(0);
                    return;
                }
            }
            let userSelector = `.webcast-chatroom-messages-list>div:nth-child(${time})>div:nth-child(2)`;
            let msgBox = await page.$(userSelector)
            let username = await page.evaluate((box) => box.querySelector('.nickname').innerText, msgBox)
            let text = await page.evaluate((box) => box.innerText, msgBox)
            print(chalk.bold.green(`\n[!] Follow Count: ${followCount}`) + chalk.bold.red(` [x] Skip Count: ${skipCount}\n`))
            if (!text || text.includes("LIVE") || text.includes("the host")) {
                console.log(chalk.bold.red(`Skipping ${username} [x]`))
                skipCount++;
            }
            else {
                await page.click(`.webcast-chatroom-messages-list>div:nth-child(${time})>div`)
                await page.waitForSelector(selectors[1], { timeout: 5000 })
                let what = await page.$(selectors[1])
                let text = await page.evaluate(el => el.textContent, what)

                if (text === "Unfollow") {
                    print(chalk.bold.red(`[x] Already Following [${username}] x (${followCount})`))
                    await page.click(selectors[2])
                    skipCount++;
                    await page.waitForTimeout(1000)
                }
                else {
                    await page.click(selectors[1], { timeout: 5000 })
                    await page.waitForTimeout(1500)
                    await page.click(selectors[2])
                    errorCount=0;
                    followCount++;
                    console.log(chalk.green(`[✔] Followed ${username} ✓ (${followCount})`));
                }

            }
        }
        catch (e) {
            errorCount++;
            skipCount++;
            console.log(chalk.bold.red(`Skipping [x]`))
        }
        time += 1;
        await doIt();
    }
    await doIt();
    await doIt();
    await doIt();

}