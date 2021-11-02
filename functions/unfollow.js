const chalk = require('chalk')
module.exports = async (page, print) => {
    const selectors = [".e1t0nnff3", ".e1t0nnff7"];
    await page.goto('https://www.tiktok.com', { timeout: 50000 });
    //wait for selector
    await page.waitForSelector("[data-e2e='suggest-see-all']", { timeout: 50000 });
    await page.click("[data-e2e='suggest-see-all']")
    await page.waitForTimeout(1000)
    await page.click(selectors[0])
    const following = await page.evaluate((s) => document.querySelector(s).innerText.replace("Following", ""), selectors[0])
    //log with chalk
    print(chalk.green(`\n[x] Currently Following: ${following}`))
    let pointer = 0;
    let lastBoxSize = 0;
    const unfollowProcess = async () => {
        let boxSize = await page.evaluate((user) => document.querySelector(`${user}:nth-child(1)`).children.length, selectors[1])
        const unfollow = async () => {
            let userVar = `${selectors[1]}:nth-child(1)>a:nth-child(${pointer + 1})`;
            let user = await page.$(userVar)
            await page.waitForTimeout(200)
            await page.evaluate(user => user.scrollIntoView(), user)
            let name = await page.evaluate(user => user.children[0].children[0].children[1].children[0].children[0].innerText, user)
            let isNotFollowing = await page.evaluate(usx => usx.children[0].children[1].innerText === "Following", user)
            if (isNotFollowing) {
                await page.waitForTimeout(500)
                await page.evaluate(user => user.children[0].children[1].click(), user)
                print(chalk.red(`\n[x] Unfollowed: ${name}`))
            } else print(chalk.yellow(`\n[=] Skipping: ${name}`))
            await page.waitForTimeout(1000)
            pointer++;
            if (pointer < boxSize) await unfollow();
        }
        if (boxSize > lastBoxSize) {
            await unfollow()
            await page.evaluate((s) => document.querySelector(`${s}:nth-child(1)`).scrollTo(0, document.querySelector(s + ":nth-child(1)").scrollHeight), selectors[1])
            lastBoxSize = boxSize;
            await page.waitForTimeout(2500)
            await unfollowProcess();
        }
        else {
            print(chalk.red(`\n[x] Finished Unfollowing`))
            require("process").exit(0)
        }
    }
    await unfollowProcess()

}