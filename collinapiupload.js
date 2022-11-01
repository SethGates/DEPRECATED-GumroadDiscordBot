const https = require("https");
const fs = require("fs");

function ckGr() {
  const grToken = process.env.grToken;
  const url = `https://api.gumroad.com/v2/products?access_token=${grToken}`;
  const lastProductIds = process.env.lastProductIds;
  let currentProductIds = [];
  let productsUpdated = false;

  const request = https.request(url, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data = data + chunk.toString();
    });

    response.on("end", () => {
      const body = JSON.parse(data);
      //console.log(data.products);
      if (body.success) {

        for (product of body.products) {
          currentProductIds.push(product.id);

          if (lastProductIds.indexOf(product.id) < 0) {
            console.log('New product found');
            productsUpdated = true;
          }
        }

        if (productsUpdated) {
          // if there are new products, update the environment varable with new list of products ids
          console.log("New products is true");
          updateProductList(JSON.stringify(currentProductIds));
          sendBotMsg();
          console.log("New products were found."); // log to console so we can see results in monitor console
        } else { 
            console.log("No updates found");
        }
      }
    });
  });

  request.on("error", (error) => {
    console.log("An error", error);
  });

  request.end();
 
}

function updateProductList(data) {
  process.env.currentProductIds = date;
}

function sendBotMsg() {
  console.log("Notifying bot");
  const dcWhId = process.env.dcWhId;
  const dcWhToken = process.env.dcWhToken;
  let url = `https://discord.com/api/webhooks/${dcWhId}/${dcWhToken}`;

  const request = https.request(url, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data = data + chunk.toString();
    });

    response.on("end", () => {
      const body = JSON.parse(data);
      console.log(body);
    });
  });

  request.on("error", (error) => {
    console.log("An error", error);
  });

  request.end();
}

const interval = 216000;  // every 60 mins
setInterval(ckGr, interval);
