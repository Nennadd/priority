// import { BrowserEvents, EventEmitter } from "puppeteer";
import puppeteer from "puppeteer-extra";
// Add stealth plugin and use defaults
import pluginStealth from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
import { delay, blockVideo, isCaptcha } from "./functions/utils.js";
import chalk from "chalk";

import UserAgent from "user-agents";
const userAgent = new UserAgent();

// NOTE Use stealth !!!
puppeteer.default.use(pluginStealth());

// NOTE Launch puppeteer-stealth
const start = async () => {
  puppeteer.default
    .launch({
      executablePath: executablePath(),
      headless: false,
      timeout: 0,
      args: [
        "--no-sandbox",
        "--no-zygote",
        "--no-first-run",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-blink-features=AutomationControlled",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--window-size=1920x1080",
      ],
    })
    .then(async (browser) => {
      const page = await browser.newPage();
      await page.setUserAgent(userAgent.random().toString());
      await page.setExtraHTTPHeaders({
        "'X-Requested-With'": "XMLHttpRequest",
        "Upgrade-Insecure-Requests": "1",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp",
      });
      await page.setContent("html", { waitUntil: "domcontentloaded" });
      await page.goto(
        // "https://api.scraperapi.com/?api_key=05d9c89b772494a6192796513d14316b&url=https%3A%2F%2Fwww.etsy.com%2F&country_code=eu",
        "https://www.etsy.com",
        {
          waitUntil: ["domcontentloaded", "networkidle2"],
        }
      );

      await isCaptcha(page);
      await blockVideo(page);

      await delay(4000);

      await page.waitForSelector(".wt-card__action-link");
      await page.click(".wt-card__action-link");
      await page.waitForSelector(".parent-hover-underline");
      await page.click(".parent-hover-underline");
      await page.waitForSelector(".parent-hover-underline");
      await page.click(".parent-hover-underline");
      await page.waitForSelector(".listing-link");

      const link = await page.evaluate(() => {
        return document
          .querySelector<any>(".listing-link")
          .getAttribute("href");
      });
      // NOTE Open product details in a new window
      const page2 = await browser.newPage();
      await page2.goto(link);

      // NOTE Check for select fields !!!
      const selectExists = !!(await page2.$(
        "#listing-page-cart .wt-select select"
      ));

      // NOTE Get ID selector and option field value
      if (selectExists) {
        const options = await page2.$$eval(
          "#listing-page-cart .wt-select select",
          (rows) => {
            return rows.map((row) => {
              return {
                selector: `#${row.getAttribute("id")}`,
                value: [...row.querySelectorAll("option")][1].getAttribute(
                  "value"
                ),
              };
            });
          }
        );

        // NOTE It looks like that when setting value to option field,
        // other fields and button are temporary disabled,
        // so I created loop with timeout to make interaction with elements slower !!!

        for (let i = 0; i < options.length; i++) {
          let k = i;
          setTimeout(function () {
            page2.waitForSelector(options[k].selector);
            page2.select(options[k].selector, options[k].value);
          }, 2000 * (k + 1));
        }
      }

      // NOTE Add product to cart !!!
      setTimeout(async () => {
        await page2.waitForSelector(".add-to-cart-form .wt-btn");
        await page2.click(".add-to-cart-form .wt-btn");
      }, 6000);

      // NOTE Go to checkout
      await page2.waitForSelector(".proceed-to-checkout");
      await page2.click(".proceed-to-checkout");

      // NOTE Continue with submit process
      await page2.waitForSelector("button[name='submit_attempt']");
      await page2.click("button[name='submit_attempt']");

      // NOTE Shipping Form !!!!
      // NOTE Wait for selectors !!!
      await page2.waitForSelector(
        ".new-buyer-shipping-form #shipping-form-email-input"
      );
      await page2.waitForSelector(
        ".new-buyer-shipping-form #shipping-form-email-confirmation"
      );
      await page2.waitForSelector(
        ".new-buyer-shipping-form input[data-field='name']"
      );
      await page2.waitForSelector(
        ".new-buyer-shipping-form input[name='first_line']"
      );
      await page2.waitForSelector(
        ".new-buyer-shipping-form input[data-field='city']"
      );
      await page2.waitForSelector(
        ".new-buyer-shipping-form input[data-field='zip']"
      );
      await page2.waitForSelector("button[data-selector-save-btn]");

      // NOTE Fill input fields !!!
      const email = await page2.$(
        ".new-buyer-shipping-form #shipping-form-email-input"
      );
      await email.type("someuser@gmail.com");

      const confirmEmail = await page2.$(
        ".new-buyer-shipping-form #shipping-form-email-confirmation"
      );
      await confirmEmail.type("someuser@gmail.com");

      const name = await page2.$(
        ".new-buyer-shipping-form input[data-field='name']"
      );
      await name.type("John Doe");

      const address = await page2.waitForSelector(
        ".new-buyer-shipping-form input[data-field='first_line']"
      );
      await address.type("Some Random Street");

      const city = await page2.waitForSelector(
        ".new-buyer-shipping-form input[data-field='city']"
      );
      await city.type("Miami");

      const zip = await page2.waitForSelector(
        ".new-buyer-shipping-form input[data-field='zip']"
      );
      await zip.type("26319");

      const btn = await page2.waitForSelector("button[data-selector-save-btn]");
      await btn.click();

      console.log(chalk.yellow("Closing the browser..."));
      setTimeout(async () => {
        await browser.close();
      }, 4000);
    });
};

start();
