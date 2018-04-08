import React, { Component } from 'react';
import { Tab, Segment, Container } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import MediaTrimmer from "./components/Trimmer/MediaTrimmer";
import MonitorApp from "./components/Monitor/MonitorApp";

class App extends Component {
  render() {

      const panes = [
          { menuItem: 'Trimmer', render: () => <Tab.Pane attached={true}><MediaTrimmer /></Tab.Pane> },
          { menuItem: { key: 'monitor', icon: 'eye', content: 'Monitor' }, render: () => <Tab.Pane attached={false} ><MonitorApp /></Tab.Pane> },
          { menuItem: { key: 'ingest', icon: 'record', content: 'Ingest' }, render: () => <Tab.Pane attached={false} disabled>Ingest</Tab.Pane> },
          { menuItem: { key: 'censor', icon: 'copyright', content: 'Censor', disabled: true }, render: () => <Tab.Pane attached={false} disabled>Censor</Tab.Pane> },
          { menuItem: { key: 'admin', icon: 'detective', content: 'Admin', disabled: true }, render: () => <Tab.Pane attached={false} disabled>Admin</Tab.Pane> },
      ];

    return (

        <Tab menu={{ secondary: true, pointing: true, color: "blue" }} panes={panes} renderActiveOnly={true} />

    );
  }
}

export default App;
