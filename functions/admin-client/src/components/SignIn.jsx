import React from "react";
import firebase from "firebase/app";
import GoogleButton from "react-google-button";
import "firebase/firestore";
import "firebase/auth";

function SignIn() {
  const auth = firebase.auth();
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(async (credentials) => {
      if (credentials.user == null) return;
      let user = credentials.user;
      let idTokenResult = await user.getIdTokenResult();
      let token = idTokenResult.token;
      let issuedAtTime = idTokenResult.issuedAtTime;
      let expirationTime = idTokenResult.expirationTime;
      console.log("token:");
      console.log(token);
      console.log("issuedAt:");
      console.log(issuedAtTime);
      console.log("expirationTime:");
      console.log(expirationTime);
    });
  };
  return <GoogleButton onClick={signInWithGoogle} />;
}

export default SignIn;
