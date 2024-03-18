// import { BrowserEvents, EventEmitter } from "puppeteer";
import puppeteer from "puppeteer-extra";
// Add stealth plugin and use defaults
import pluginStealth from "puppeteer-extra-plugin-stealth";
const { executablePath } = require("puppeteer");

type Products = {
  title: string;
  link: string;
  price: string;
};

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

    await page.waitForSelector(".wt-card__action-link");
    await page.click(".wt-card__action-link");
    await page.waitForSelector(".parent-hover-underline");
    await page.click(".parent-hover-underline");
    await page.waitForSelector(".parent-hover-underline");
    await page.click(".parent-hover-underline");

    // NOTE Get Products !!!
    await page.waitForSelector("ol .wt-list-unstyled");
    const products: Products[] = await page.$$eval(
      "ol .wt-list-unstyled",
      (rows) => {
        return [...rows].slice(0, 10).map((row) => {
          return {
            title: row.querySelector("div div a h2").textContent.trim(),
            link: row.querySelector("div div a").getAttribute("href"),
            price: row.querySelector("div div a .currency-value").textContent,
          };
        });
      }
    );
    console.log("PRODUCTS: ", products);
    // NOTE Products Details !!!
    if (products.length) {
      for (let product of products) {
        const detailsPage = await browser.newPage();
        await detailsPage.setExtraHTTPHeaders({
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        });
        await detailsPage.setContent("html", { waitUntil: "domcontentloaded" });
        await detailsPage.goto(product.link);
        await detailsPage.close();
      }
    }

    // await browser.close();
  });
