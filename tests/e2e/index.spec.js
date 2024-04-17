import { expect, test } from "@playwright/test";
import lazySizes from "lazysizes";

const pagesWithSimpleImages = [
  { url: "/demos/image_basic-VLL.html", description: "image basic demo - Vanilla lazy load", scriptName: "VanillaLazyload" },
  { url: "/demos/image_basic-LS.html", description: "image basic demo - Lazysizes", scriptName: "Lazysizes" },
];

for (const { url, description, scriptName } of pagesWithSimpleImages) {
  test(description, async ({ page, browser }) => {

    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForLoadState("load");

    const lazyImages = await page.locator("img");
    const imageCount = await lazyImages.count();

    expect(imageCount).toBeGreaterThan(30);

    const paintTimingJson = await page.evaluate(() =>
      JSON.stringify(window.performance.getEntriesByType('paint'))
    )

    console.log(scriptName +" Paint", paintTimingJson)

    // Eventually scroll into view and check if it loads
    for (let i = 0; i < imageCount; i++) {
      const image = lazyImages.nth(i);
      await image.scrollIntoViewIfNeeded();

      // Check the src attribute
      await expect(image).toHaveAttribute("src");
    }

    const pageTimingJson = await page.evaluate(() =>
      JSON.stringify(window.performance.getEntries())
    )
    console.log(scriptName +" Page", pageTimingJson)
  });
}
