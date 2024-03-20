import { Page } from "puppeteer";
import { delay, blockVideo } from "./utils.js";
import chalk from "chalk";

type Product = {
  title: string;
  link: string;
  price: string;
};

export const getProducts = async (page: Page): Promise<Product[]> => {
  await delay(5000);
  await blockVideo(page);
  await page.waitForSelector(".wt-card__action-link");
  await page.click(".wt-card__action-link");
  await page.waitForSelector(".parent-hover-underline");
  await page.click(".parent-hover-underline");
  await page.waitForSelector(".parent-hover-underline");
  await page.click(".parent-hover-underline");

  await page.waitForSelector("ol .wt-list-unstyled");
  const products: Product[] = await page.$$eval(
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

  products.forEach((product: Product, index: number) => {
    console.log(`${chalk.cyan(`Product ${index + 1}:`)}
     ${chalk.yellow("Name: ")} ${product.title} 
     ${chalk.yellow("Link: ")} ${product.link} 
     ${chalk.yellow("Price: ")} ${product.price}`);
  });

  return products;
};
