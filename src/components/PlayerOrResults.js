import React, { Component } from "react";
import cameraIcon from "../assets/images/camera_icon.png";
import loadingIcon from "../assets/images/loading_icon.png";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dataURLtoFile from "../utils/dataURLtoFile";
import RenderResults from "./RenderResults";

export default class componentName extends Component {
  constructor() {
    super();
    this.cameraNumber = 0;
    this.state = {
      imageDataURL: null,
      loading: false,
      detected: "",
      score: "",
    };
  }

  async componentDidMount() {
    this.initializeMedia();
  }

  getListOfVideoInputs = async () => {
    // Get the details of audio and video output of the device
    const enumerateDevices = await navigator.mediaDevices.enumerateDevices();

    //Filter video outputs (for devices with multiple cameras)
    return enumerateDevices.filter((device) => device.kind === "videoinput");
  };

  // create a function to ask for permission to use the camera
  initializeMedia = async () => {
    this.setState({ imageDataURL: null });
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.getUserMedia = function (constraints) {
        // First get ahold of getUserMedia, if present
        var getUserMedia =
          navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
          return Promise.reject(new Error("getUserMedia Not Implemented"));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }

    //Get the details of video inputs of the device
    const videoInputs = await this.getListOfVideoInputs();

    //The device has a camera
    if (videoInputs.length) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: {
              exact: videoInputs[this.cameraNumber].deviceId,
            },
          },
        })
        .then((stream) => {
          this.player.srcObject = stream;
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      alert("The device does not have a camera");
    }
  };

  // captures selfies from the camera
  capturePicture = async () => {
    this.setState({ loading: true });
    var canvas = document.createElement("canvas");
    canvas.width = this.player.videoWidth;
    canvas.height = this.player.videoHeight;
    var contex = canvas.getContext("2d");
    contex.drawImage(this.player, 0, 0, canvas.width, canvas.height);
    this.player.srcObject.getVideoTracks().forEach((track) => {
      track.stop();
    });

    this.setState({ imageDataURL: canvas.toDataURL() });
    const file = await dataURLtoFile(canvas.toDataURL("image/png"), "test.png");
    let data = new FormData();
    data.append("file", file, file.name);
    data.append("UUID", uuidv4());
    this.uploadSelfie(data);
  };

  // Upload the selfie to Trust Stamp SDK and get a response
  uploadSelfie = async (data) => {
    axios
      .post(
        "https://api.truststamp.net/api/v2/proxy/proof-of-liveness/photo/",
        data,
        {
          headers: {
            accept: "application/json",
            "Accept-Language": "en-US,en;q=0.8",
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
            Authorization: `JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0MiwidXNlcm5hbWUiOiJjbm93YWsiLCJleHAiOjkwNjUyMjAyNDksImVtYWlsIjoiIiwib3JpZ19pYXQiOjE2MDAyNjAyNDl9.mH1xAB1KlWi2CR80h0WqGBzTzYNchcbUFYDCA1FZQIk`,
          },
        }
      )
      .then((response) => {
        if (response.data) {
          // make get axios request to get the proof of liveness
          const { request_id } = response.data;
          this.sendPhoto(request_id);
        }
        console.log(response.data);
      })
      .catch((error) => {
        console.log(">..", error);
        alert("something went wrong");
      });
  };

  // Send a photo to pad/combined/ and proof-of-liveness/photo/
  sendPhoto = async (request_id) => {
    axios
      .get(
        `https://api.truststamp.net/api/v1/proxy/proof-of-liveness/photo?request_id=${request_id}`,
        {
          headers: {
            accept: "application/json",
            "Accept-Language": "en-US,en;q=0.8",
            Authorization: `JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo0MiwidXNlcm5hbWUiOiJjbm93YWsiLCJleHAiOjkwNjUyMjAyNDksImVtYWlsIjoiIiwib3JpZ19pYXQiOjE2MDAyNjAyNDl9.mH1xAB1KlWi2CR80h0WqGBzTzYNchcbUFYDCA1FZQIk`,
          },
        }
      )
      .then((response) => {
        if (response.status === 202) {
          this.setState({
            detected: "Still Processing (try again)",
          });
          this.setState({ score: null });
          this.setState({ loading: false });
          return;
        }
        this.setState({
          detected: response.data.data.fake_detected.toString(),
        });
        this.setState({ score: response.data.data.score });
        this.setState({ loading: false });
      })
      .catch((error) => {
        this.setState({ loading: false });
        if (error.response) {
          this.setState({ detected: error.response.data.error_code });
          this.setState({ score: "null" });
        }
        console.log(error.response);
      });
  };

  render() {
    return (
      <>
        {Boolean(this.state.imageDataURL) ? (
          <RenderResults
            loading={this.state.loading}
            imageDataURL={this.state.imageDataURL}
            detected={this.state.detected}
            score={this.state.score}
            initializeMedia={this.initializeMedia}
            capturePicture={this.capturePicture}
          />
        ) : (
          <div className="feed">
            <video
              className="video"
              ref={(refrence) => {
                this.player = refrence;
              }}
              autoPlay
            ></video>
            <img
              onClick={this.capturePicture}
              src={cameraIcon}
              alt="Logo"
              className="camera-icon"
            />
          </div>
        )}
      </>
    );
  }
}
