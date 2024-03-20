import { Page } from "puppeteer";
import fs from "fs";
import chalk from "chalk";
import Rembrandt from "rembrandt";
import path, { dirname } from "path";

export const delay = (time: number) => {
  console.log(`Waiting ${time / 1000} seconds...`);
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

export const blockVideo = async (page: Page) => {
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
};

export const createFile = async (productDetails) => {
  try {
    console.log(chalk.yellow("Creating local JSON file..."));
    const detailsJSON = JSON.stringify(productDetails);
    fs.writeFileSync(`./src/data/product-details.json`, detailsJSON);
    console.log(chalk.green("JSON file created successfully..."));
  } catch (error) {
    console.log(chalk.red("Failed to create file"));
  }
};

export const isCaptcha = async (page: Page) => {
  let captchaExists = false;
  let originalImage: any = "";

  // await page.setRequestInterception(true);
  // page.on("request", (request) => request.continue());
  // page.on("response", async (response) => {
  //   if (response.request().resourceType() === "image") {
  //     originalImage = await response.buffer().catch(() => {});
  //   }
  // });
  try {
    const iframeSrcArr = await page.$$eval("iframe", (iframes) => {
      return iframes.map((iframe) => {
        return iframe.getAttribute("src");
      });
    });

    for (let iframeSrc of iframeSrcArr) {
      if (iframeSrc.includes("https://geo.captcha-delivery.com/captcha/")) {
        captchaExists = true;

        // const elementHandle = await page.$(`iframe[src='${iframeSrc}']`);
        // const frame = await elementHandle.contentFrame();

        // await frame.waitForSelector("#captcha-container .slider");

        // const sliderElement = await frame.$(
        //   "#captcha-container .sliderContainer"
        // );
        // const slider = await sliderElement.boundingBox();

        // const sliderHandle = await frame.$("#captcha-container .slider");
        // const handle = await sliderHandle.boundingBox();

        // let currentPosition = 0;
        // let bestSlider = {
        //   position: 0,
        //   difference: 100,
        // };

        // await page.mouse.move(
        //   handle.x + handle.width / 2,
        //   handle.y + handle.height / 2
        // );
        // await page.mouse.down();

        // while (currentPosition < slider.width - handle.width / 2) {
        //   await page.mouse.move(
        //     handle.x + currentPosition,
        //     handle.y + handle.height / 2 + Math.random() * 10 - 5
        //   );

        //   const imageContainer = await frame.$("canvas");
        //   const img = await imageContainer.screenshot({ path: "img.jpg" });
        //   console.log("ORIGINAL: ", originalImage);
        //   const rembrandt = new Rembrandt({
        //     imageA: originalImage,
        //     imageB: fs.readFileSync("img"),
        //     tresholdType: Rembrandt.TRESHOLD_PERCENT,
        //   });

        //   let result = rembrandt.compare();
        //   let difference = result.percentageDifference * 100;

        //   if (difference < bestSlider.difference) {
        //     bestSlider.difference = difference;
        //     bestSlider.position = currentPosition;
        //   }

        //   currentPosition += 5;
        //   // *********
        // }

        //   await page.mouse.move(
        //     handle.x + bestSlider.position,
        //     handle.y + handle.height / 2,
        //     { steps: 10 }
        //   );
        //   await page.mouse.up();
      }
    }

    console.log(chalk.yellow("CAPTCHA EXISTS: "), captchaExists);
  } catch (error) {
    console.log(chalk.red(error));
  }
  return captchaExists;
};
