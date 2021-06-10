import React from "react";
import firebase from "firebase/app";

function SignOutButton() {
  const auth = firebase.auth();
  return auth.currentUser == null ? null : (
    <button className="btn btn-warning" onClick={() => auth.signOut()}>
      Sign Out
    </button>
  );
}

export default SignOutButton;
