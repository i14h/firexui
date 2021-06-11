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
    <div className="card mt-2">
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
        <div className="form-row my-2">
          <label className="text-secondary col-form-label-sm">
            Delete Original Files ?
          </label>
          <select class="form-control" id="action-on-resize">
            <option>Delete on successful resize</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div className="form-row my-2">
          <label className="text-secondary col-form-label-sm">
            Cloud Storage Path Of Original Files
          </label>
          <input
            type="text"
            id="disabledTextInput"
            className="form-control w-full"
            placeholder="e.g. /images"
          />
        </div>

        <div className="form-row my-2">
          <label className="text-secondary col-form-label-sm">
            Cloud Storage Paths To Exclude
          </label>
          <input
            type="text"
            id="disabledTextInput"
            className="form-control"
            placeholder="e.g. /images/high-res"
          />
        </div>

        <div className="form-row my-2">
          <label className="text-secondary col-form-label-sm">
            Cloud Storage Path For Resized Images
          </label>
          <input
            type="text"
            id="disabledTextInput"
            className="form-control"
            placeholder="e.g. thumbnails"
          />
        </div>

        <div className="form-row my-2">
          <label className="text-secondary col-form-label-sm">
            Cache-Control Header
          </label>
          <input
            type="text"
            id="disabledTextInput"
            className="form-control"
            placeholder="e.g. max-age=86400"
          />
        </div>
        <div className="form-row my-2">
          <label className="text-secondary col-form-label-sm">
            Resized Image File Name Pattern:
          </label>
          <input
            type="text"
            id="disabledTextInput"
            className="form-control"
            placeholder="e.g. &#36;&#123;original_name&#125;_&#36;&#123;width&#125;x&#36;&#123;heigth&#125;"
          />
        </div>
        <div className="form-row my-2">
          <label className="text-secondary col-form-label-sm pt-3 mr-2">
            Result Formats:
          </label>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox1"
              value="option1"
            />
            <label
              class="text-secondary col-form-label-sm form-check-label"
              for="inlineCheckbox1"
            >
              original
            </label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox2"
              value="option2"
            />
            <label
              class="text-secondary col-form-label-sm form-check-label"
              for="inlineCheckbox2"
            >
              jepg
            </label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox3"
              value="option3"
            />
            <label
              class="text-secondary col-form-label-sm form-check-label"
              for="inlineCheckbox3"
            >
              png
            </label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox3"
              value="option3"
            />
            <label
              class="text-secondary col-form-label-sm form-check-label"
              for="inlineCheckbox3"
            >
              tiff
            </label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="checkbox"
              id="inlineCheckbox3"
              value="option3"
            />
            <label
              class="text-secondary col-form-label-sm form-check-label"
              for="inlineCheckbox3"
            >
              webp
            </label>
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
            Update
          </button>
        )}
      </form>
    </div>
  );
}

export default ConfigForm;
