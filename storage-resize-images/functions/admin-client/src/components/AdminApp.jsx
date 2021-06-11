import React, { useState } from "react";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import SignOutButton from "./SignOutButton";
import ConfigForm from "./ConfigForm";
import axios from "axios";
import ExtensionSettings from "./ExtensionSettings";
import Stats from "./Stats";

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
      <header className="w-full top-0 bg-blue-400 h-20 flex place-content-between shadow-md">
        <div className="flex pl-5 justify-center place-self-center">
          <img
            className="h-14 inline"
            src="https://www.gstatic.com/mobilesdk/200707_mobilesdk/resize_images_52@2x.png"
            alt="logo"
          />
          <h1 className="inline text-gray-100 align-text-bottom text-4xl pl-3 self-center">
            Image Resizer Extension Dashboard
          </h1>
        </div>
        <SignOutButton />
      </header>
      <Stats />
      <div className="flex mx-60 my-2 px-4 py-2 bg-white shadow-md sm:rounded-md">
        <div className="w-1/2">
          <div className="my-3 text-xl text-gray-500 text-left">
            Current Settings
          </div>

          {settings ? (
            <div>
              <p className="text-left text-gray-600 my-2">
                Resized Dimensions (Width x Height):
                <span className="font-mono ml-2">
                  {settings.width} x {settings.height}
                </span>
              </p>
              <p className="text-left text-gray-600 my-2">
                Delete Original Files:
                <span className="font-mono ml-2">
                  Delete on successful resize
                </span>
              </p>
              <p className="text-left text-gray-600 my-2">
                Cloud Storage Path For Resized Images:
                <span className="font-mono ml-2">/thumbnails</span>
              </p>
              <p className="text-left text-gray-600 my-2">
                Path of Original Images:
                <span className="font-mono ml-2">/images</span>
              </p>
              <p className="text-left text-gray-600 my-2">
                Exclude Paths:
                <span className="font-mono ml-2">None</span>
              </p>
              <p className="text-left text-gray-600 my-2">
                Cache-Control Header:
                <span className="font-mono ml-2">max-age=86400</span>
              </p>
              <p className="text-left text-gray-600 my-2">
                Resized File Names:
                <span className="font-mono ml-2">
                  &#36;&#123;original_name&#125;_&#36;&#123;width&#125;x&#36;&#123;heigth&#125;
                </span>
              </p>
              <p className="text-left text-gray-600 my-2">
                Convert to following types:
                <span className="font-mono ml-2">jpeg, png</span>
              </p>
            </div>
          ) : (
            <div class="spinner-border text-warning" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          )}
        </div>
        <div className="w-1/2 my-3 text-xl text-gray-500 text-left">
          <p>Modify Settings</p>

          <ConfigForm onSettingsChange={onSettingsChange} />
        </div>
      </div>
    </div>
  );
}

export default AdminApp;

// <header className="">
//   {/* <p>Hi, {user.displayName}</p> */}
//   <p>Hi, Ehsan N!</p>
//   <p>This is the Admin WebApp. You have superpowers!🔥 🚀</p>
//   <div className="">{/* <SignOutButton /> */}</div>
//   <div>
//     <p>Current Extension Settings:</p>
//     {settings ? (
//       <div>
//         Width = {settings.width}, Height = {settings.height}
//       </div>
//     ) : (
//       <div class="spinner-border text-warning" role="status">
//         <span class="sr-only">Loading...</span>
//       </div>
//     )}
//   </div>
//   <ConfigForm onSettingsChange={onSettingsChange} />
// </header>
