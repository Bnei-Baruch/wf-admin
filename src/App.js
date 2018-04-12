import React, { Component } from 'react';
import { Tab } from 'semantic-ui-react'
import './stylesheets/sematic-reset.css';
import './stylesheets/scoped_semantic_ltr.css';
import './stylesheets/scoped_semantic_rtl.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import LoginPage from './components/LoginPage';
import {client, getUser} from "./components/UserManager";
import MonitorApp from "./components/Monitor/MonitorApp";
import IngestApp from "./components/Ingest/IngestApp";
import CensorApp from "./components/Censor/CensorApp";
import AdminApp from "./components/Admin/AdminApp";

class App extends Component {

    state = {
        user: null,
        disabled: true,
        loading: true,
        mode: null,
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
        let bbrole = user.roles.filter(role => role.match(/^(bb_user)$/)).length;
        console.log(":: BB Role: ", bbrole);
        if(bbrole >= 0) {
            this.setState({user: user, disabled: false});
        } else {
            alert("Access denied!");
            client.signoutRedirect();
        }
    };

    setMode = (mode) => {
        console.log(":: Setting Mode:", mode);
        this.setState({mode});
    };

  render() {

      let login = (<LoginPage onInsert={this.setMode} user={this.state.user} loading={this.state.loading} />);
      //let main = (<IngestApp mode={this.state.mode} />);

      const panes = [
          { menuItem: { key: 'main', icon: 'home', content: 'Main', disabled: false }, render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
          { menuItem: { key: 'ingest', icon: 'record', content: 'Ingest', disabled: this.state.disabled }, render: () => <Tab.Pane attached={false} ><IngestApp mode={this.state.mode} /></Tab.Pane> },
          { menuItem: { key: 'monitor', icon: 'eye', content: 'Monitor', disabled: this.state.disabled }, render: () => <Tab.Pane attached={true} ><MonitorApp /></Tab.Pane> },
          { menuItem: { key: 'censor', icon: 'copyright', content: 'Censor', disabled: this.state.disabled }, render: () => <Tab.Pane attached={false} ><CensorApp/></Tab.Pane> },
          { menuItem: { key: 'admin', icon: 'detective', content: 'Admin', disabled: this.state.disabled }, render: () => <Tab.Pane attached={false} ><AdminApp/></Tab.Pane> },
      ];

    return (

        <Tab menu={{ secondary: true, pointing: true, color: "blue" }} panes={panes} />

    );
  }
}

export default App;
