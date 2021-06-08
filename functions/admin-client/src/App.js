import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";
import SignIn from "./components/SignIn";
import SignOutButton from "./components/SignOutButton";

var UserStatus = {
  kUnauthenticated: 0,
  kAuthenticatedButNotAdmin: 1,
  kAuthenticatedAdmin: 2,
};

async function isUserAnAdmin(user) {
  let idTokenResult = await user.getIdTokenResult();
  let token = idTokenResult.token;
  try {
    const result = await axios.get("admin/work", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (result.status === 200) {
      // The server has confirmed that this user is an Admin User.
      return true;
    }
  } catch (e) {
    console.log(e.message);
    return false;
  }
  return false;
}

function App() {
  const [userStatus, setUserStatus] = useState(UserStatus.kUnauthenticated);

  if (!firebase.apps.length) {
    var elem = document.getElementById("firebase-app");
    var apiKey = elem.getAttribute("api-key");
    var projectId = elem.getAttribute("project-id");
    firebase.initializeApp({
      apiKey: apiKey,
      authDomain: projectId + ".firebaseapp.com",
      projectId: projectId,
    });
  }

  // Note: using `useAuthState` is only allowed after
  // `firebase.initializeApp()` has been performed.
  const auth = firebase.auth();
  const [user] = useAuthState(auth);
  if (user) {
    isUserAnAdmin(user).then((admin) => {
      if (admin) {
        setUserStatus(UserStatus.kAuthenticatedAdmin);
      } else {
        setUserStatus(UserStatus.kAuthenticatedButNotAdmin);
        auth.signOut();
      }
    });
  }

  if (user && userStatus === UserStatus.kAuthenticatedAdmin) {
    // This is the homepage for authenticated administrators.
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Hi, {user.displayName}</p>
          <p>This is the Admin WebApp. You have superpowers!🔥 🚀</p>
          <div className="">
            <SignOutButton />
          </div>
        </header>
      </div>
    );
  }

  if (userStatus === UserStatus.kAuthenticatedButNotAdmin) {
    // This is the homepage for those who are authenticated, but the server
    // has determined that they are not administrators.
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>You are not authorized to access this content.</p>
          <div className="">
            <SignIn />
          </div>
        </header>
      </div>
    );
  }

  // This is the homepage for those who are not not authenticated yet.
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Welcome to the Admin Portal!</p>
        <div className="">
          <SignIn />
        </div>
      </header>
    </div>
  );
}

export default App;
