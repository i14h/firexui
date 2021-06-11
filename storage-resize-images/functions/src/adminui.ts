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

const app = express();
app.use(express.static(path.join(__dirname, "..", "admin-client", "build")));
app.use(express.static(path.join(__dirname, "..", "home-client", "build")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors);
app.use(cookieParser);

/// Returns the Api-Key and Project-ID for the Firebase Project that uses
/// this extension.
///
/// This is currently hard-coded, but should be replaced by looking up
/// environment variables that the Cloud Function has access to.
const getFirebaseProjectInfo = () => {
  return {
    apiKey:
      process.env.FIREBASE_API_KEY || "AIzaSyARZCj-D0vytZnZhhOpvDFLY572kVGWSxo",
    projectId: process.env.GCLOUD_PROJECT || "hw2021-firexui",
  };
};

/// Returns whether the given auth token is an admin.
///
/// This is currently hard-coded, but should be replaced by looking up
/// an environment variable.
const isAdmin = (token: auth.DecodedIdToken) => {
  // TODO: Get the real list of admins using env vars.
  let adminList = [
    process.env.ADMIN_EMAIL,
    "rafikhan@gmail.com",
    "ehsannas@gmail.com",
    "imanrahmati@google.com",
  ];
  functions.logger.log(`current adminList:${adminList}`);
  functions.logger.log(`token.email:${token.email}`);
  functions.logger.log(
    `result:${token.email && adminList.includes(token.email)}`
  );

  return token.email && adminList.includes(token.email);
};

/// Returns the location in Firebase Storage where this extension will write the
/// information provided by the admins using the admin-client.
/// We can define a new parameter for the extension for this.
export const getConfigFilePath = () => {
  return "firexui/config.json";
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

/// Validates the FirebaseIdToken in the request via Authorization header or
/// session. Responds with status code 200 on success, and 403 on failure.
const validateFirebaseIdTokenAndRespond = async (
  req: ex.Request,
  res: ex.Response
) => {
  if (await validateFirebaseIdToken(req)) {
    functions.logger.log("validateFirebaseIdToken returned true");
    res.status(200).send();
  } else {
    functions.logger.log("validateFirebaseIdToken returned false");
    res.status(403).send("Unauthorized");
  }
  return;
};

/// Takes JSON data from the request and stores it as a JSON file in Firebase Storage.
/// Rejects requests that do not have valid admin priviledges.
const writeConfigsToFirebaseStorage = async (
  req: ex.Request,
  res: ex.Response
) => {
  console.log("Received config:", req.body);

  // Validate the request is coming from an admin.
  if (!(await validateFirebaseIdToken(req))) {
    res.status(403).send("Unauthorized");
    return;
  }

  // Upload a JSON file to Firebase Storage that contains information about how
  // this extension should work.
  let file = admin.storage().bucket().file(getConfigFilePath());
  file.save(JSON.stringify(req.body), function (err: any) {
    if (!err) {
      // File written successfully.
      res.status(200).send("Successfully wrote configurations");
    } else {
      res.status(503).send("Upload failed. Please try again later.");
    }
  });
  return;
};

/// Reads the current configuration JSON from Firebase Storage and returns it.
/// Rejects requests that do not have valid admin priviledges.
const readConfigsFromFirebaseStorage = async (
  req: ex.Request,
  res: ex.Response
) => {
  console.log("Received config:", req.body);

  // Validate the request is coming from an admin.
  if (!(await validateFirebaseIdToken(req))) {
    res.status(403).send("Unauthorized");
    return;
  }

  // Read from Firebase Storage
  try {
    let file = admin.storage().bucket().file(getConfigFilePath());

    file.download().then(function (data: any) {
      const contents = data[0];
      console.log("Read configs from storage:", contents);
      res.status(200).send(contents);
    });
  } catch (e) {
    // If no file has ever been written from the Admin UI, the file would be
    // missing.
    res.status(404).send();
  }
  return;
};

/// Returns the home-client web app.
app.get("/home", (request: any, response: any) => {
  response.sendFile(
    path.join(__dirname, "..", "home-client", "build", "index.html")
  );
});

/// Returns the admin-client web app.
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
app.get("/admin/read-config", readConfigsFromFirebaseStorage);
app.post("/admin/write-config", writeConfigsToFirebaseStorage);
app.get("/", (request: any, response: any) => {
  response.status(200).send();
});

export const adminui = app;
