import p, { Browser } from "puppeteer";

export const getWebsitePageLinks = async (url: string) => {
  try {
    const browser = await p.launch({ headless: "new" });
    const allLinks = await recursivelyTravelPageLinks(url, browser);
    await browser.close();
    return allLinks;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const matchesDomain = (urlOne: string, urlTwo: string) => {
  const urlOneDomain = urlOne.split("/")[2];
  const urlTwoDomain = urlTwo.split("/")[2];
  return urlOneDomain === urlTwoDomain;
};

export const isAFile = (url: string) => {
  const urlParts = url.split("/");
  const lastPart = urlParts[urlParts.length - 1];
  const isAFile = lastPart.includes(".");
  return isAFile;
};

export const endsWithHash = (url: string) => {
  const urlParts = url.split("/");
  const lastPart = urlParts[urlParts.length - 1];
  const endsWithHash = lastPart.includes("#");
  return endsWithHash;
};

export const recursivelyTravelPageLinks = async (url: string, pup: Browser) => {
  try {
    const allLinks: string[] = [url];

    const page = await pup.newPage();
    await page.goto(url);

    const links = await page.$$eval("a", (links) =>
      links.map((link) => link.href)
    );
    const usableLinks = links.filter((link) => {
      return matchesDomain(url, link) && !isAFile(link) && !endsWithHash(link);
    });
    allLinks.push(...usableLinks);

    for (const link of usableLinks) {
      const subLinks = await recursivelyTravelPageLinks(link, pup);
      allLinks.push(...subLinks);
    }

    return allLinks
      .filter((link, index) => allLinks.indexOf(link) === index)
      .sort();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getPageTextContent = async (url: string) => {
  try {
    const browser = await p.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url);
    const textContent = await page.$eval("body", (el) => el.textContent);
    await browser.close();
    return textContent;
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const getMultiplePageTextContent = async (urls: string[]) => {
  try {
    const browser = await p.launch({ headless: "new" });
    const page = await browser.newPage();
    const textContentArray: string[] = [];
    for (const url of urls) {
      await page.goto(url);
      const textContent = await page.$eval("body", (el) => el.textContent);
      if (textContent) {
        textContentArray.push(textContent);
      }
    }
    await browser.close();
    return textContentArray;
  } catch (error) {
    console.error(error);
    return [];
  }
};
