import * as functions from "firebase-functions";
import * as ex from "express";
import { auth } from "firebase-admin";

const path = require("path");
const admin = require("firebase-admin");
const express = require("express");
const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });
const fs = require("fs");
const bodyParser = require("body-parser");

admin.initializeApp();
const app = express();
app.use(express.static(path.join(__dirname, "..", "admin-client", "build")));
app.use(express.static(path.join(__dirname, "..", "home-client", "build")));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

/// Returns the Api-Key and Project-ID for the Firebase Project that uses
/// this extension.
///
/// This is currently hard-coded, but should be replaced by looking up
/// environment variables that the Cloud Function has access to.
const getFirebaseProjectInfo = () => {
  return {
    apiKey: "AIzaSyARZCj-D0vytZnZhhOpvDFLY572kVGWSxo",
    projectId: "hw2021-firexui",
    // apiKey: process.env.FIREBASE_API_KEY,
    // projectId: process.env.GCLOUD_PROJECT,
  };
};

/// Returns whether the given auth token is an admin.
///
/// This is currently hard-coded, but should be replaced by looking up
/// an environment variable.
const isAdmin = (token: auth.DecodedIdToken) => {
  // TODO: Get the real list of admins using env vars.
  //let adminList = [process.env.ADMIN_EMAIL];
  let adminList = ["ehsannas@gmail.com"];
  return token.email && adminList.includes(token.email);
};

/// Returns true if the given request has a valid FirebaseIdToken, and false otherwise.
/// This is done by checking the Authorization header and the session.
const validateFirebaseIdToken = async (req: ex.Request) => {
  functions.logger.log("Check if request is authorized with Firebase ID token");
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    functions.logger.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
    functions.logger.log(`Received ID token from client:${idToken}`);
  } else if (req.cookies) {
    functions.logger.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No valid authorization header and no cookie.
    functions.logger.error(
      "No Firebase ID token was passed as a Bearer token in the Authorization header.",
      "Make sure you authorize your request by providing the following HTTP header:",
      "Authorization: Bearer <Firebase ID Token>",
      'or by passing a "__session" cookie.'
    );
    return false;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    functions.logger.log("ID Token correctly decoded", decodedIdToken);
    functions.logger.log(`Logged in admin with uid: ${decodedIdToken.uid}`);
    return isAdmin(decodedIdToken);
  } catch (error) {
    functions.logger.error("Error while verifying Firebase ID token:", error);
    return false;
  }
};

const validateFirebaseIdTokenAndRespond = async (
  req: ex.Request,
  res: ex.Response
) => {
  if (validateFirebaseIdToken(req)) {
    res.status(200).send();
  } else {
    res.status(403).send("Unauthorized");
  }
  return;
};

const writeConfigsToFirebaseStorage = async (
  req: ex.Request,
  res: ex.Response
) => {
  console.log("Got body:", req.body);

  if (!validateFirebaseIdToken(req)) {
    res.status(403).send("Unauthorized");
    return;
  }

  var bucket = admin.storage().bucket();

  let config = {
    width: 300,
    height: 300,
  };

  // Upload a JSON file to Firebase Storage that contains information about how
  // this extension should work.
  let file = bucket.file("firexui/config.json");
  file.save(JSON.stringify(config), function (err: any) {
    if (!err) {
      // File written successfully.
      res.status(200).send("Successfully wrote configurations");
    } else {
      res.status(503).send("Upload failed. Please try again later.");
    }
  });
  return;
};

app.use(cors);
app.use(cookieParser);

app.get("/home", (request: any, response: any) => {
  response.sendFile(
    path.join(__dirname, "..", "home-client", "build", "index.html")
  );
});

app.get("/admin", (request: any, response: any) => {
  // We need to look up information about the Firebase Project that is using
  // this extension, and include it in the admin app.
  // The admin client will use this information to request authentication from
  // Firebase Auth.
  let file = path.join(__dirname, "..", "admin-client", "build", "index.html");
  let page = fs.readFileSync(file, "utf8");
  let info = getFirebaseProjectInfo();
  let apiKey = info.apiKey;
  let projectId = info.projectId;
  page = page.replace('api-key="API-KEY"', `api-key="${apiKey}"`);
  page = page.replace('project-id="PROJECT-ID"', `project-id="${projectId}"`);

  response.send(page);
});

app.get("/admin/work", validateFirebaseIdTokenAndRespond);
app.post("/admin/write-config", writeConfigsToFirebaseStorage);

app.get("/", (request: any, response: any) => {
  response.status(200).send();
});

exports.app = functions.https.onRequest(app);
