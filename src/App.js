import React, { Component } from 'react';
import { Tab, Segment, Container } from 'semantic-ui-react'
// import 'semantic-ui-css/semantic.min.css';
import './stylesheets/sematic-reset.css';
import './stylesheets/scoped_semantic_ltr.css';
import './stylesheets/scoped_semantic_rtl.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import MonitorApp from "./components/Monitor/MonitorApp";
import IngestApp from "./components/Ingest/IngestApp";

class App extends Component {
  render() {

      const panes = [
          { menuItem: { key: 'ingest', icon: 'record', content: 'Ingest' }, render: () => <Tab.Pane attached={true} ><IngestApp /></Tab.Pane> },
          { menuItem: { key: 'monitor', icon: 'eye', content: 'Monitor' }, render: () => <Tab.Pane attached={true} ><MonitorApp /></Tab.Pane> },
          { menuItem: { key: 'censor', icon: 'copyright', content: 'Censor', disabled: true }, render: () => <Tab.Pane attached={false} disabled>Censor</Tab.Pane> },
          { menuItem: { key: 'admin', icon: 'detective', content: 'Admin', disabled: true }, render: () => <Tab.Pane attached={false} disabled>Admin</Tab.Pane> },
      ];

    return (

        <Tab menu={{ secondary: true, pointing: true, color: "blue" }} panes={panes} />

    );
  }
}

export default App;
