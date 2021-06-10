"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminui = void 0;
const functions = require("firebase-functions");
const path = require("path");
const admin = require("firebase-admin");
const express = require("express");
const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });
const fs = require("fs");
admin.initializeApp();
const app = express();
app.use(express.static(path.join(__dirname, "..", "admin-client", "build")));
app.use(express.static(path.join(__dirname, "..", "home-client", "build")));
/// Returns the Api-Key and Project-ID for the Firebase Project that uses
/// this extension.
///
/// This is currently hard-coded, but should be replaced by looking up
/// environment variables that the Cloud Function has access to.
const getFirebaseProjectInfo = () => {
    return {
        apiKey: process.env.FIREBASE_API_KEY,
        projectId: process.env.GCLOUD_PROJECT,
    };
};
/// Returns whether the given auth token is an admin.
///
/// This is currently hard-coded, but should be replaced by looking up
/// an environment variable.
const isAdmin = (token) => {
    // TODO: Get the real list of admins using env vars.
    let adminList = [process.env.ADMIN_EMAIL];
    return token.email && adminList.includes(token.email);
};
const validateFirebaseIdToken = async (req, res) => {
    functions.logger.log("Check if request is authorized with Firebase ID token");
    let idToken;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")) {
        functions.logger.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split("Bearer ")[1];
        functions.logger.log(`Received ID token from client:${idToken}`);
    }
    else if (req.cookies) {
        functions.logger.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    else {
        // No valid authorization header and no cookie.
        functions.logger.error("No Firebase ID token was passed as a Bearer token in the Authorization header.", "Make sure you authorize your request by providing the following HTTP header:", "Authorization: Bearer <Firebase ID Token>", 'or by passing a "__session" cookie.');
        res.status(403).send("Unauthorized");
        return;
    }
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        functions.logger.log("ID Token correctly decoded", decodedIdToken);
        functions.logger.log(`Logged in admin with uid: ${decodedIdToken.uid}`);
        if (isAdmin(decodedIdToken)) {
            res.status(200).send();
        }
        else {
            res.status(403).send("Unauthorized");
        }
        return;
    }
    catch (error) {
        functions.logger.error("Error while verifying Firebase ID token:", error);
        res.status(403).send("Unauthorized");
        return;
    }
};
app.use(cors);
app.use(cookieParser);
app.get("/home", (request, response) => {
    response.sendFile(path.join(__dirname, "..", "home-client", "build", "index.html"));
});
app.get("/admin", (request, response) => {
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
app.get("/admin/work", validateFirebaseIdToken);
app.get("/", (request, response) => {
    response.status(200).send();
});
exports.adminui = app;
