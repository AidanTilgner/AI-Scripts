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

export const extractDomain = (url: string) => {
  const withoutHttp = url.replace("https://", "").replace("http://", "");
  const formatted = withoutHttp.split(".").slice(-2).join(".");
  // remove endpoint
  const formattedWithoutEndpoint = formatted.split("/")[0];
  return formattedWithoutEndpoint;
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

export const matchesDomain = (urlOne: string, urlTwo: string) => {
  const urlOneDomain = extractDomain(urlOne);
  const urlTwoDomain = extractDomain(urlTwo);
  return urlOneDomain === urlTwoDomain;
};

export const recursivelyTravelPageLinks = async (
  url: string,
  pup: Browser,
  visitedUrls: Set<string> = new Set()
) => {
  try {
    const allLinks: string[] = [];

    visitedUrls.add(url);

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
      if (!visitedUrls.has(link)) {
        const subLinks = await recursivelyTravelPageLinks(
          link,
          pup,
          visitedUrls
        );
        allLinks.push(...subLinks);
      }
    }

    return allLinks.filter((link, index) => allLinks.indexOf(link) === index);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getPageTextContent = async (url: string) => {
  try {
    console.log("Going to URL: ", url);
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
    const textContentArray: {
      url: string;
      content: string;
    }[] = [];
    for (const url of urls) {
      await page.goto(url);
      const textContent = await page.$eval("body", (el) => el.textContent);
      const links = await page.$$eval("a", (links) =>
        links.map((link) => link.href)
      );
      const content = `
      Text Content: ${textContent?.replace(/\n/g, "").replace(/ {2,}/g, " ")}\n

      Links:\n ${links.join("\n")}
      `;
      if (textContent) {
        textContentArray.push({
          url,
          content,
        });
      }
    }
    await browser.close();
    return textContentArray;
  } catch (error) {
    console.error(error);
    return [];
  }
};
