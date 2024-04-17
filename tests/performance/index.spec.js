import { expect, test } from "@playwright/test";
import {chromium} from "playwright";

const pagesWithSimpleImages = [
  { url: "/demos/image_basic-VLL.html", description: "image basic demo - Vanilla lazy load", scriptName: "VanillaLazyload" },
  { url: "/demos/image_basic-LS.html", description: "image basic demo - Lazysizes", scriptName: "Lazysizes" },
];

const networkConditions = {
  'Slow 3G': {
    download: ((500 * 1000) / 8) * 0.8,
    upload: ((500 * 1000) / 8) * 0.8,
    latency: 400 * 5,
  },
  'Fast 3G': {
    download: ((1.6 * 1000 * 1000) / 8) * 0.9,
    upload: ((750 * 1000) / 8) * 0.9,
    latency: 150 * 3.75,
  },
};

for (const condition in networkConditions) {
  for (const {url, description, scriptName} of pagesWithSimpleImages) {
    test(description + " - " + condition, async ({ page, browser }) => {
      const context = await browser.newContext();
      const session = await context.newCDPSession(page)
      // set network conditions
      await session.send("Performance.enable")
      await session.send("Network.emulateNetworkConditions", {
        downloadThroughput: networkConditions[condition].download,
        uploadThroughput: networkConditions[condition].upload,
        latency: networkConditions[condition].latency,
        offline: false
      })
      await page.goto(url, { waitUntil: 'networkidle' });

      // crawl the page
      const lazyImages = await page.locator("img");
      const imageCount = await lazyImages.count();

      await lazyImages.nth(1).click();

      expect(imageCount).toBeGreaterThan(30);

      await page.evaluate(() => (window.performance.mark('Perf:Started')))
      await page.waitForLoadState("load");
      await page.evaluate(() => (window.performance.mark('Perf:Loaded')))

      for (let i = 0; i < imageCount; i++) {
        const image = lazyImages.nth(i);
        await image.scrollIntoViewIfNeeded();

        // Check the src attribute
        await expect(image).toHaveAttribute("src");
      }

      await page.evaluate(() => (window.performance.mark('Perf:Ended')))
      //Performance measure
      await page.evaluate(() => (window.performance.measure("overall", "Perf:Started", "Perf:Ended")))

      const getAllMarksJson = await page.evaluate(() => (JSON.stringify(window.performance.getEntriesByType("mark"))))
      const getAllMarks = await JSON.parse(getAllMarksJson)
      console.log('window.performance.getEntriesByType("mark")', getAllMarks)

      const getAllMeasuresJson = await page.evaluate(() => (JSON.stringify(window.performance.getEntriesByType("measure"))))
      const getAllMeasures = await JSON.parse(getAllMeasuresJson)
      console.log('window.performance.getEntriesByType("measure")', getAllMeasures)

      console.log("=============CDP Performance Metrics===============")
      let performanceMetrics = await session.send("Performance.getMetrics")
      console.log(performanceMetrics.metrics)
    });
  }
}
