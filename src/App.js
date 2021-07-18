import { v4 as uuidv4 } from "uuid";
import "./App.css";
import React from "react";
import PlayerOrImage from "./components/PlayerOrResults";
import cameraIcon from "./assets/images/camera_icon.png";
import loadingIcon from "./assets/images/loading_icon.png";
import axios from "axios";

class App extends React.Component {
  render() {
    return (
      <div className="app">
        <PlayerOrImage />
      </div>
    );
  }
}

export default App;
