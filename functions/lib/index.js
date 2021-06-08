"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const path = require("path");
const admin = require('firebase-admin');
const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
admin.initializeApp();
const app = express();
app.use(express.static(path.join(__dirname, "..", "admin-client", "build")));
app.use(express.static(path.join(__dirname, "..", "home-client", "build")));
const validateFirebaseIdToken = async (req, res, next) => {
    functions.logger.log('Check if request is authorized with Firebase ID token');
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        functions.logger.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>', 'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        functions.logger.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    else if (req.cookies) {
        functions.logger.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    }
    else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        functions.logger.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        return;
    }
    catch (error) {
        functions.logger.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    }
};
app.use(cors);
app.use(cookieParser);
app.get("/home", (request, response) => {
    response.sendFile(path.join(__dirname, "..", "home-client", "build", "index.html"));
});
app.get("/admin", (request, response) => {
    response.sendFile(path.join(__dirname, "..", "admin-client", "build", "index.html"));
});
app.get("/admin/work", validateFirebaseIdToken);
app.get("/", (request, response) => {
    response.status(200).send();
});
exports.app = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map