const https = require("https");
const fs = require("fs");


function ckGr() {
  const grToken = process.env.grToken;
  // GR App
  const url = `https://api.gumroad.com/v2/products?access_token=${grToken}`;
  //GR App
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
  process.env.currentProductIds = data;
}

function sendBotMsg() {
  console.log("Notifying bot");
  const grStoreUrl = process.env.grStoreUrl;
  const dcWhId = process.env.dcWhId;
  // Disc Bot
  const dcWhToken = process.env.dcWhToken;
  // Disc Bot
  const msg = JSON.stringify({
    'content': `There's a new product!\nMore info at:${grStoreUrl}`
  });

  const host = "discord.com";
  const dcPath = `/api/webhooks/${dcWhId}/${dcWhToken}`;
  const opt = {
    hostname: host,
    method: 'POST',
    path: dcPath,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': msg.length
    }
  }

  const request = https.request(opt, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data = data + chunk.toString();
    });
  });

  request.on("error", (error) => {
    console.log("An error", error);
  });

  request.write(msg);
  request.end();
}

const interval = 10000; //216000;  // every 60 mins
setInterval(ckGr, interval);