import { Browser, Page, executablePath } from "puppeteer";
import puppeteer from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import { getProducts } from "./functions/getProducts.js";
import { getProductDetails } from "./functions/getProductDetails.js";
import chalk from "chalk";
import { isCaptcha, createFile } from "./functions/utils.js";

import UserAgent from "user-agents";

const userAgent = new UserAgent();

type Product = {
  title: string;
  link: string;
  price: string;
};

type ProductDetails = {
  name: string;
  price: string;
  sizes: string;
  images: string;
};

const headers = {
  "'X-Requested-With'": "XMLHttpRequest",
  "Upgrade-Insecure-Requests": "1",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp",
};

// NOTE Use stealth !!!
puppeteer.default.use(pluginStealth());

// NOTE Launch puppeteer-stealth
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
  .then(async (browser: Browser) => {
    const page: Page = await browser.newPage();
    await page.setUserAgent(userAgent.random().toString());
    await page.setExtraHTTPHeaders(headers);
    await page.setContent("html", { waitUntil: "domcontentloaded" });

    await page.goto("https://www.etsy.com", {
      waitUntil: ["domcontentloaded", "networkidle2"],
    });

    await isCaptcha(page);

    // NOTE Get Products !!!
    const products: Product[] = await getProducts(page);

    // NOTE Products Details - Create file !!!
    if (products.length) {
      const productDetails: ProductDetails[] = await getProductDetails(
        browser,
        products
      );
      await createFile(productDetails);
    } else {
      console.log(chalk.red("There are no products..."));
    }

    await browser.close();
  })
  .catch((error: Error) => console.log(chalk.red(error)));
