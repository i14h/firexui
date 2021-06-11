import React from "react";
import firebase from "firebase/app";

function SignOutButton() {
  const auth = firebase.auth();
  if (auth.currentUser == null) return null;

  return (
    <button
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 rounded-lg h-12 place-self-center mr-5"
      onClick={() => auth.signOut()}
    >
      Sign Out
    </button>
  );
}

export default SignOutButton;
