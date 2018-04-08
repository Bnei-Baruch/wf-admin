import React, { Component } from 'react';
import { Tab, Segment, Container } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import MediaTrimmer from "./components/Trimmer/MediaTrimmer";
import MonitorApp from "./components/Monitor/MonitorApp";

class App extends Component {
  render() {

      const panes = [
          { menuItem: 'Monitor', render: () => <Tab.Pane attached={false}><MonitorApp /></Tab.Pane> },
          { menuItem: 'Trimmer', render: () => <Tab.Pane attached={false}><MediaTrimmer /></Tab.Pane> },
          { menuItem: 'Ingest', render: () => <Tab.Pane attached={false}>Tab 3 Content</Tab.Pane> },
      ]

    return (

        <Tab menu={{ secondary: true, pointing: true }} panes={panes} />

    );
  }
}

export default App;
