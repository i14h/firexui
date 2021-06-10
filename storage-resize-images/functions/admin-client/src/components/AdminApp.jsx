import React, { useState } from "react";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import SignOutButton from "./SignOutButton";
import ConfigForm from "./ConfigForm";
import axios from "axios";
import ExtensionSettings from "./ExtensionSettings";

function AdminApp() {
  const auth = firebase.auth();
  const [user] = useAuthState(auth);
  const [settings, setSettings] = useState(null);

  const getCurrentConfigs = async () => {
    let idTokenResult = await user.getIdTokenResult();
    let token = idTokenResult.token;
    try {
      const result = await axios.get("admin/read-config", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(result.status);
      console.log(result.data);
      if (result.status === 200) {
        setSettings(result.data);
      } else {
        setSettings(ExtensionSettings());
      }
      return;
    } catch (e) {
      console.log(e.message);
      return false;
    }
  };

  const onSettingsChange = async (success) => {
    if (success) {
      setSettings(null);
    } else {
      alert("Update was not successful. Please try again later.");
    }
  };

  if (!settings) {
    getCurrentConfigs();
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Hi, {user.displayName}</p>
        <p>This is the Admin WebApp. You have superpowers!🔥 🚀</p>
        <div className="">
          <SignOutButton />
        </div>
        <div>
          <p>Current Extension Settings:</p>
          {settings ? (
            <div>
              Width = {settings.width}, Height = {settings.height}
            </div>
          ) : (
            <div class="spinner-border text-warning" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          )}
        </div>
        <ConfigForm onSettingsChange={onSettingsChange} />
      </header>
    </div>
  );
}

export default AdminApp;
