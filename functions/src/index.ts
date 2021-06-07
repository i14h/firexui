import * as functions from "firebase-functions";
const express = require("express");

const app = express();

app.get("/home", (request: any, response: any) => {
  functions.logger.info("Hello from /home!", { structuredData: true });
  response.send("Hello from /home!");
});

app.get("/admin", (request: any, response: any) => {
  functions.logger.info("Hello from /admin!", { structuredData: true });
  response.send("Hello from /admin!");
});

app.get("/", (request: any, response: any) => {
  response.status(200).send();
});

exports.app = functions.https.onRequest(app);
