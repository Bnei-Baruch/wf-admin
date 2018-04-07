import React, { Component } from 'react';
import { Segment, Container } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import MediaTrimmer from "./components/Trimmer/MediaTrimmer";
//import MonitorApp from "./components/Monitor/MonitorApp";

class App extends Component {
  render() {
    return (

        <MediaTrimmer />
        /*<MonitorApp />*/
    );
  }
}

export default App;
