import React, { Component } from 'react';
import { Tab, Grid } from 'semantic-ui-react'
import WFDBCapture from './WFDBCapture';
import WFDBTrimmer from './WFDBTrimmer';
import WFDBCarbon from './WFDBCarbon';
import WFDBKmedia from './WFDBKmedia';
import './WFDB.css';
class WFDB extends Component {

    state = {
        user: null,
        disabled: true,
    };

  render() {

      const panes = [
          { menuItem: { key: 'Ingest', content: 'Ingest' },
              render: () => <Tab.Pane attached={true} ><WFDBCapture /></Tab.Pane> },
          { menuItem: { key: 'trimmer', content: 'Trimmer' },
              render: () => <Tab.Pane attached={false} ><WFDBTrimmer /></Tab.Pane> },
          { menuItem: { key: 'carbon', content: 'Carbon' },
              render: () => <Tab.Pane attached={false} ><WFDBCarbon /></Tab.Pane> },
          { menuItem: { key: 'Kmedia', content: 'Kmedia' },
              render: () => <Tab.Pane attached={false} ><WFDBKmedia /></Tab.Pane> },
      ];

    return (
        <Grid className='wfdb_app'>
        <Tab menu={{ pointing: true }} panes={panes} />
        </Grid>
    );
  }
}

export default WFDB;
