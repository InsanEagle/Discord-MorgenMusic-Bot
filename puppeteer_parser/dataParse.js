const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const parser = async function (data) {
  const dom = new JSDOM(data);

  let resultObj = {};

  let arrayOfResults = [...dom.window.document.querySelectorAll(".MjjYud")];

  let del = arrayOfResults[0]?.querySelector(".Aysk6e");
  if (del) {
    arrayOfResults.shift();
  }

  let arrLength = arrayOfResults.length;

  for (let i = 0; i < arrLength; i++) {
    resultObj[i] = {};

    let title = arrayOfResults[i]?.querySelector(".DKV0Md")?.textContent;
    title = title.substring(0, title.length - 10);
    resultObj[i].title = title;

    resultObj[i].duration =
      arrayOfResults[i]?.querySelector(".J1mWY")?.textContent;

    let text = arrayOfResults[i]
      ?.querySelector(".ct3b9e")
      ?.querySelector("a")?.href;
    text = text?.slice(text.indexOf("http"));
    resultObj[i].url = text?.slice(text.indexOf("http"));
  }

  return resultObj;
};

module.exports = parser;
