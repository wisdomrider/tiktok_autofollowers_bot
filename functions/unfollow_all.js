const chalk = require('chalk')



module.exports = async (page, print) => {
    await page.goto('https://www.tiktok.com', { timeout: 50000 });
    await page.waitForSelector("[data-e2e=profile-icon]", { timeout: 50000 });
    await page.waitForTimeout(1000)
    await page.click("[data-e2e=profile-icon]");
    await page.waitForTimeout(1000)
    await page.click("[data-e2e=profile-icon]");
    async function unFollowAll() {
        print(chalk.white(`[+] Reloading page`))
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        await page.waitForSelector("[data-e2e=following-count]", { timeout: 50000 });
        await page.waitForTimeout(1000)
        await page.click("[data-e2e=following-count]");
        let following = await page.$eval("[data-e2e=following-count]", el => el.innerText);

        if (following == 0) {
            await print(chalk.red(`[+] You are not following anyone`))
            print(chalk.green(`[+] Process completed`))
            process.exit(0)
            return;
        }
        else {
            await print(chalk.green(`[+] You are following ${chalk.bold(following)} users`))
        }

        await page.waitForTimeout(600)
        let users = await page.$$("[data-e2e=suggest-card]");
        print(chalk.yellow(`[+] Unfollowing new users from list [${users.length}].`))
        for (let i = 0; i < users.length; i++) {
            let buttonText = await page.evaluate((el) => el.querySelector("button").innerText, users[i]);
            let username = await page.evaluate((el) => el.querySelector("[data-e2e=suggest-user-subtitle]").innerText, users[i]);
            if (["Following", "Friends"].includes(buttonText)) {
                await page.evaluate((el) => el.querySelector("button").click(), users[i]);
                print(chalk.red(`[-] Unfollowed ${chalk.bold(username)}`))
                await page.waitForTimeout(600)
            }
            print(chalk.yellow(`Remaining users: ${following - users.length - i - 1}`))
        }


        await unFollowAll();
    }

    await unFollowAll();
    print(chalk.green("[+] Unfollowed all users."))


}