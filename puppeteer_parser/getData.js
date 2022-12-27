const htmlReader = async function (songname) {
  const browser = global.browser;
  if (!browser) {
    throw new Error(
      "Browser didn't load. Maybe you need to wait some time after server is up"
    );
  }
  const url = `https://www.google.com/search?q=${songname}+site%253Ayoutube.com%2Fwatch&tbm=vid`;
  const page = await browser.newPage();

  await page.goto(url);

  // Wait for the results page to load and display the results.
  const resultsSelector = ".v7W49e";
  await page.waitForSelector(resultsSelector);

  // Extract the results from the page.
  const results = await page.evaluate((resultsSelector) => {
    return document.querySelector(resultsSelector).innerHTML;
  }, resultsSelector);

  await page.close();
  return results;
};

module.exports = htmlReader;
