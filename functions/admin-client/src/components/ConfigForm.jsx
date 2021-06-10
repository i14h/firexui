import React, { useRef, useState } from "react";
import axios from "axios";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";

function ConfigForm(props) {
  const auth = firebase.auth();
  const [user] = useAuthState(auth);
  const resizedWidthRef = useRef(null);
  const resizedHeightRef = useRef(null);
  let [submitInProgress, setSubmitInProgress] = useState(false);
  let onSettingsChange = props.onSettingsChange;

  const onFormSubmit = async (event) => {
    event && event.preventDefault();
    setSubmitInProgress(true);
    let idTokenResult = await user.getIdTokenResult();
    let token = idTokenResult.token;
    try {
      const result = await axios.post(
        "admin/write-config",
        {
          width: resizedWidthRef.current.value,
          height: resizedHeightRef.current.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (result.status === 200) {
        onSettingsChange(true);
      } else {
        onSettingsChange(false);
      }
    } catch (e) {
      console.log(e.message);
      onSettingsChange(false);
    }
    setSubmitInProgress(false);
    return;
  };

  return (
    <div className="card mt-2" style={{ width: "30rem" }}>
      <form className="card-body" autoComplete="off" onSubmit={onFormSubmit}>
        <div className="form-row">
          <div className="form-group col-md-6 text-left">
            <label
              for="resized-width"
              className="text-secondary col-form-label-sm"
            >
              Width After Resize
            </label>
            <input
              type="text"
              className="form-control"
              id="resized-width"
              placeholder="Width (Pixels)"
              ref={resizedWidthRef}
              autoComplete="off"
            />
          </div>
          <div className="form-group col-md-6 text-left">
            <label
              for="resized-height"
              className="text-secondary col-form-label-sm"
            >
              Height After Resize
            </label>
            <input
              type="text"
              className="form-control"
              id="resized-height"
              placeholder="Height (Pixels)"
              ref={resizedHeightRef}
              autoComplete="off"
            />
          </div>
        </div>

        {submitInProgress ? (
          <button class="btn btn-primary" type="button" disabled>
            <span
              className="spinner-border spinner-border-sm mr-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </button>
        ) : (
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        )}
      </form>
    </div>
  );
}

export default ConfigForm;
