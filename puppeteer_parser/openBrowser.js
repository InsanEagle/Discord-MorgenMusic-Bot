const puppeteer = require("puppeteer");

const openBrowser = async function () {
  let start = performance.now();
  console.log("Wait for browser is loading...");

  const browser = await puppeteer.launch();

  console.log(
    `Browser is ready. Loaded for ${Math.round(performance.now() - start)} ms`
  );
  console.log(`------------------------------`);

  global.browser = browser;
};

module.exports = openBrowser;
