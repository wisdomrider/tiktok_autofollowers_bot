const chalk = require('chalk')
module.exports = async (page, print) => {
    await page.goto('https://www.tiktok.com', { timeout: 50000 });
    //wait for selector
    await page.waitForSelector(".see-more", { timeout: 50000 });
    await page.click(".see-more")
    await page.waitForTimeout(1000)
    await page.click(".tab")
    const following = await page.evaluate(() => document.querySelector(".tab").innerText.replace("Following", ""))
    //log with chalk
    print(chalk.green(`\n[x] Currently Following: ${following}`))
    let pointer = 0;
    let lastBoxSize = 0;
    const unfollowProcess = async () => {
        let boxSize = await page.evaluate(() => document.querySelector(".user-list:nth-child(1)").children.length)
        const unfollow = async () => {
            let userVar = `.user-list:nth-child(1)>a:nth-child(${pointer + 1})`;
            let user = await page.$(userVar)
            await page.evaluate(user => user.scrollIntoView(), user)
            let name = await page.evaluate(user => user.querySelector(".unique-id").innerText, user)
            let follow_btn = await page.$(`${userVar}>div>div:nth-child(2)>button`)
            let isNotFollowing = await page.evaluate(follow_btn => follow_btn.innerText === "Following", follow_btn)
            if (isNotFollowing) {
                await page.waitForTimeout(1000)
                await page.evaluate(follow_btn => follow_btn.click(), follow_btn)
                print(chalk.red(`\n[x] Unfollowed: ${name}`))
            } else print(chalk.yellow(`\n[=] Skipping: ${name}`))
            await page.waitForTimeout(1000)
            pointer++;
            if (pointer < boxSize) await unfollow();
        }
        if (boxSize > lastBoxSize) {
            await unfollow()
            await page.evaluate(() => document.querySelector(".user-list:nth-child(1)").scrollTo(0, document.querySelector(".user-list:nth-child(1)").scrollHeight))
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