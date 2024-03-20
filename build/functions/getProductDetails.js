import { delay } from "./utils.js";
import chalk from "chalk";
const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "'X-Requested-With'": "XMLHttpRequest",
    "Upgrade-Insecure-Requests": "1",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp",
};
export const getProductDetails = async (browser, products) => {
    let productDetails = [];
    for (let product of products) {
        const detailsPage = await browser.newPage();
        await detailsPage.setExtraHTTPHeaders(headers);
        await detailsPage.setContent("html", { waitUntil: "domcontentloaded" });
        await detailsPage.goto(product.link, {
            waitUntil: ["domcontentloaded", "networkidle2"],
        });
        await delay(2000);
        await detailsPage.waitForSelector(".body-wrap .image-col");
        await detailsPage.waitForSelector(".body-wrap .cart-col");
        const details = await detailsPage.$eval(".body-wrap", (item) => {
            // NOTE Product Name !!!
            const name = item.querySelector("h1").textContent.trim();
            // NOTE Product Price !!!
            const price = item
                .querySelector("div[data-selector='price-only'] p")
                .textContent.split(/\r?\n/)[2]
                .trim();
            // NOTE SIZES !!!!
            // NOTE Check for select fields !!!
            const variationExists = !!item.querySelector(".cart-col #listing-page-cart div[data-selector='listing-page-variation']");
            let sizes = [];
            if (variationExists) {
                // NOTE Select label !!!
                const labels = item.querySelector(".cart-col #listing-page-cart div[data-selector='listing-page-variation'] div label span[data-label]")
                    ? item.querySelectorAll(".cart-col #listing-page-cart div[data-selector='listing-page-variation'] div label span[data-label]")
                    : "";
                // NOTE Check is there SIZE label and take text content of option fields !!!
                for (let label of labels) {
                    if (label.textContent.toLowerCase().indexOf("size") > 0) {
                        const sz = Array.from(item.querySelectorAll("#listing-page-cart .wt-select select option"));
                        sizes = sz.slice(1).map((el) => el.textContent.trim());
                    }
                }
            }
            // NOTE IMAGES !!!
            const imgNodes = item.querySelectorAll(".body-wrap .image-col ul li img");
            const images = [...imgNodes].map((img) => img.getAttribute("src"));
            return {
                name,
                price,
                sizes,
                images,
            };
        });
        productDetails.push(details);
        console.log(`${chalk.blueBright(details.name.slice(0, 25) + "...")} details scraped successfully`);
        await detailsPage.close();
    }
    return productDetails;
};
//# sourceMappingURL=getProductDetails.js.map