// import { BrowserEvents, EventEmitter } from "puppeteer";
import puppeteer from "puppeteer-extra";
// Add stealth plugin and use defaults
import pluginStealth from "puppeteer-extra-plugin-stealth";
const { executablePath } = require("puppeteer");

// NOTE Use stealth !!!
puppeteer.use(pluginStealth());

// NOTE Launch puppeteer-stealth
puppeteer
  .launch({ executablePath: executablePath(), headless: false, timeout: 0 })
  .then(async (browser) => {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    await page.setContent("html", { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 1280, height: 720 });

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url().toLowerCase();
      const resourceType = request.resourceType();

      if (
        resourceType === "media" ||
        url.endsWith(".mp4") ||
        url.endsWith(".avi") ||
        url.endsWith(".flv") ||
        url.endsWith(".mov") ||
        url.endsWith(".wmv")
      ) {
        console.log(`ABORTING: video`);
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto("https://etsy.com");

    const captchaExists = !!(await page.$("div #captcha__element"));

    console.log("CAPTCHA: ", page);

    await page.waitForSelector(".wt-card__action-link");
    await page.click(".wt-card__action-link");
    // await page.waitForSelector(".listing-link");
    // await page.click(".listing-link");
    await page.waitForSelector(".parent-hover-underline");
    await page.click(".parent-hover-underline");
    await page.waitForSelector(".parent-hover-underline");
    await page.click(".parent-hover-underline");
    await page.waitForSelector(".listing-link");
    // await page.click(".listing-link");

    // await page.waitForNavigation({ waitUntil: "networkidle2" });

    const link = await page.evaluate(() => {
      return document.querySelector<any>(".listing-link").getAttribute("href");
    });
    const page2 = await browser.newPage();
    await page2.goto(link);

    const selectExists = !!(await page2.$(
      "#listing-page-cart .wt-select select"
    ));
    // console.log("EXISTS: ", selectExists);

    if (selectExists) {
      // const elements = await page2.$$(".wt-select select");
      const option = await page2.$$eval(
        "#listing-page-cart .wt-select select",
        (rows) => {
          return rows.map((row) => {
            return [...row.querySelectorAll("option")][1].getAttribute("value");
            // return [...row.querySelectorAll("option")].map((cell) => {
            //   return cell.getAttribute("value");
            // });
          });
        }
      );

      console.log("OPTION: ", option);
    } else {
      await page2.waitForSelector(".add-to-cart-form .wt-btn");
      await page2.click(".add-to-cart-form .wt-btn");

      await page2.waitForSelector(".proceed-to-checkout");
      await page2.click(".proceed-to-checkout");

      await page2.waitForSelector("button[name='submit_attempt']");
      await page2.click("button[name='submit_attempt']");
    }

    // await page.waitForSelector("#variation-selector-0");
    // await page.select("#variation-selector-0", "2424729542");

    // await page.waitForSelector("#variation-selector-0");
    // await page.click("#variation-selector-0");
    // await page.select("#variation-selector-0", "3676521554");

    // await browser.close();
  });
