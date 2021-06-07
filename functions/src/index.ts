import * as functions from "firebase-functions";
const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "..", "admin-client", "build")));

app.get("/home", (request: any, response: any) => {
  functions.logger.info("Hello from /home!", { structuredData: true });
  response.send("Hello from /home!");
});

app.get("/admin", (request: any, response: any) => {
  response.sendFile(
    path.join(__dirname, "..", "admin-client", "build", "index.html")
  );
});

app.get("/", (request: any, response: any) => {
  response.status(200).send();
});

exports.app = functions.https.onRequest(app);
