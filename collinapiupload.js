// Written by Seth Gates, and Jason Newell
// Env variables are stored on a seperate SaaS

const https = require("https");
const fs = require("fs");
const JSONdb = require("simple-json-db");
const db = new JSONdb("productIds.json");

if (db.get("lastProductIds") == undefined) {
  db.set("lastProductIds", []);
  // AWS / Persistent ID storage
}

function ckGr() {
  const grToken = process.env.grToken;
  // GR App
  const url = `https://api.gumroad.com/v2/products?access_token=${grToken}`;
  //GR App
  const lastProductIds = db.get("lastProductIds");
  let currentProductIds = [];
  let productsUpdated = false;

  const request = https.request(url, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data = data + chunk.toString();
    });

    response.on("end", () => {
      const body = JSON.parse(data);
      console.log(data.products);
      if (body.success) {
        for (product of body.products) {
          currentProductIds.push(product.id);

          if (lastProductIds.indexOf(product.id) < 0) {
            console.log("New product found");
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
  //process.env.lastProductIds = data;
  db.set("lastProducts", data);
}

function sendBotMsg() {
  console.log("Notifying bot");
  const grStoreUrl = process.env.grStoreUrl;
  const dcAppId = process.env.dcAppId;
  // Disc Bot //
  const dcToken = process.env.dcToken;
  // Disc Bot //
  const msg = JSON.stringify({
    content: `There's a new product!\nMore info at:${grStoreUrl}`,
  });

  const host = "discord.com";
  const dcPath = `/api/webhooks/${dcAppId}/${dcToken}`;
  // dc path to change to Bot API (Channel message, in Discord docs. What is needed for headers?)
  // Other IDS in Env, for message
  const opt = {
    hostname: host,
    method: "POST",
    path: dcPath,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": msg.length,
    },
  };

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

const interval = 1000; //216000;  // every 60 mins
setInterval(ckGr, interval);
