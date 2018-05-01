import React, { Component, Fragment } from 'react';
import { Tab, Label } from 'semantic-ui-react'
import './stylesheets/sematic-reset.css';
import './stylesheets/scoped_semantic_ltr.css';
import './stylesheets/scoped_semantic_rtl.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import LoginPage from './components/LoginPage';
import {client, getUser} from "./components/UserManager";
import MonitorApp from "./apps/Monitor/MonitorApp";
import IngestApp from "./apps/Ingest/IngestApp";
import CensorApp from "./apps/Censor/CensorApp";
import AdminApp from "./apps/Admin/AdminApp";
import ArichaApp from "./apps/Aricha/ArichaApp";
import DgimaApp from "./apps/Dgima/DgimaApp";
import MainPage from "./apps/Insert/MainPage";
import WFDB from "./apps/WFDB/WFDB";
import CarbonApp from "./apps/Carbon/CarbonApp";
import {getConv} from "./shared/tools";

class App extends Component {

    state = {
        count: 0,
        user: null,
        disabled: true,
        loading: true,
        wf_ingest: true,
        wf_censor: true,
        wf_admin: true,
        wf_aricha: true,
        wf_dgima: true,
        wf_public: true,

    };

    componentDidMount() {
        // FIXME: hack solution
        setTimeout(() => this.setState({ loading: false }), 1000);
        getUser(cb => {
            if(cb) {
                this.checkPermission(cb);
            }
        });
        client.signinRedirectCallback().then(function(user) {
            console.log(":: callback", user);
            if(user.state) {
                window.location = user.state;
            }
        }).catch(function(err) {
            //console.log("callback error",err);
        });
    };

    checkPermission = (user) => {
        let wf_public = user.roles.filter(role => role === 'bb_user').length === 0;
        let wf_ingest = user.roles.filter(role => role === 'wf_ingest').length === 0;
        let wf_censor = user.roles.filter(role => role === 'wf_censor').length === 0;
        let wf_admin = user.roles.filter(role => role === 'wf_admin').length === 0;
        let wf_aricha = user.roles.filter(role => role === 'wf_aricha').length === 0;
        let wf_dgima = user.roles.filter(role => role === 'wf_dgima').length === 0;
        console.log(":: App - got user: ", user);
        if(!wf_public) {
            this.setState({user, wf_public, wf_admin, wf_censor, wf_ingest, wf_aricha, wf_dgima});
            setInterval(() => getConv('state/langcheck', (data) => {
                let count = Object.keys(data).length;
                if (this.state.count !== count)
                    this.setState({count})
            }), 10000 );
        } else {
            alert("Access denied!");
            client.signoutRedirect();
        }
    };

    setCount = (count) => {
        this.setState({count});
    };

  render() {

      const {count,wf_public,wf_ingest,wf_censor,wf_admin,wf_aricha,wf_dgima} = this.state;
      let login = (<LoginPage user={this.state.user} loading={this.state.loading} />);
      let l = (<Label key='Carbon' floating circular size='mini' color='red'>{count}</Label>);

      const panes = [
          { menuItem: { key: 'Home', icon: 'home', content: 'Home', disabled: false },
              render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
          { menuItem: { key: 'carbon', icon: 'settings', content: <Fragment>Carbon{count > 0 ? l : ""}</Fragment>, disabled: wf_ingest },
              render: () => <Tab.Pane attached={false} ><CarbonApp onUpdate={this.setCount} user={this.state.user} admin={this.state.wf_admin}/></Tab.Pane> },
          { menuItem: { key: 'ingest', icon: 'record', content: 'Ingest', disabled: wf_ingest },
              render: () => <Tab.Pane attached={false} ><IngestApp user={this.state.user} admin={this.state.wf_admin} /></Tab.Pane> },
          { menuItem: { key: 'censor', icon: 'copyright', content: 'Censor', disabled: wf_censor },
              render: () => <Tab.Pane attached={false} ><CensorApp user={this.state.user} /></Tab.Pane> },
          { menuItem: { key: 'admin', icon: 'detective', content: 'Admin', disabled: wf_admin },
              render: () => <Tab.Pane attached={false} ><AdminApp user={this.state.user} /></Tab.Pane> },
          { menuItem: { key: 'monitor', icon: 'eye', content: 'Monitor', disabled: wf_public },
              render: () => <Tab.Pane attached={false} ><MonitorApp user={this.state.user} /></Tab.Pane> },
          { menuItem: { key: 'aricha', icon: 'edit', content: 'Aricha', disabled: wf_aricha },
              render: () => <Tab.Pane attached={false} ><ArichaApp user={this.state.user} /></Tab.Pane> },
          { menuItem: { key: 'dgima', icon: 'film', content: 'Dgima', disabled: wf_dgima },
              render: () => <Tab.Pane attached={false} ><DgimaApp user={this.state.user} /></Tab.Pane> },
          { menuItem: { key: 'insert', icon: 'archive', content: 'Insert', disabled: wf_aricha },
              render: () => <Tab.Pane attached={false} ><MainPage user={this.state.user} /></Tab.Pane> },
          { menuItem: { key: 'wfdb', icon: 'heartbeat', content: 'Status', disabled: wf_admin },
              render: () => <Tab.Pane attached={false} ><WFDB user={this.state.user} /></Tab.Pane> },
      ];

    return (

        <Tab menu={{ secondary: true, pointing: true, color: "blue" }} panes={panes} />

    );
  }
}

export default App;
