import React, { Component } from "react";
import loadingIcon from "../assets/images/loading_icon.png";

export default class RenderResults extends Component {
  render() {
    return (
      <div>
        {this.props.loading === false ? (
          <div className="results">
            <img
              src={this.props.imageDataURL}
              alt="cameraPic"
              className="displayImage"
            />
            <br />
            <p className="text">fake_detected: {this.props.detected}</p>
            <p className="text">score: {this.props.score}</p>
            <br />
            <div className="try-div">
              <button onClick={this.props.initializeMedia} className="try-again">
                try again
              </button>
            </div>
          </div>
        ) : (
          <div>
            <img
              onClick={this.props.capturePicture}
              src={loadingIcon}
              alt="loading"
              className="loading-icon"
            />
          </div>
        )}
      </div>
    );
  }
}
