import React, { Component, lazy, Suspense } from 'react';
import { Tab, Label } from 'semantic-ui-react'
import './stylesheets/sematic-reset.css';
import './stylesheets/scoped_semantic_ltr.css';
import './stylesheets/scoped_semantic_rtl.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import LoginPage from './components/LoginPage';
import {client} from "./components/UserManager";
import {getData} from "./shared/tools";

class App extends Component {

    state = {
        count: 0,
        user: null,
        wf_ingest: true,
        wf_censor: true,
        wf_admin: true,
        wf_jobs: true,
        wf_aricha: true,
        wf_dgima: true,
        wf_insert: true,
        wf_external: true,
        wf_public: true,
        wf_upload: true,
        wf_sirtutim: true,
    };

    componentDidMount() {
    };

    checkPermission = (user) => {
        let wf_public = user.roles.filter(role => role === 'bb_user').length === 0;
        let wf_ingest = user.roles.filter(role => role === 'wf_ingest').length === 0;
        let wf_censor = user.roles.filter(role => role === 'wf_censor').length === 0;
        let wf_admin = user.roles.filter(role => role === 'wf_admin').length === 0;
        let wf_jobs = user.roles.filter(role => role === 'wf_jobs').length === 0;
        let wf_aricha = user.roles.filter(role => role === 'wf_aricha').length === 0;
        let wf_insert = user.roles.filter(role => role === 'wf_insert').length === 0;
        let wf_dgima = user.roles.filter(role => role === 'wf_dgima').length === 0;
        let wf_external = user.roles.filter(role => role === 'wf_external').length === 0;
        let wf_upload = user.roles.filter(role => role === 'wf_upload').length === 0;
        let wf_sirtutim = user.roles.filter(role => role === 'wf_sirtutim').length === 0;
        if(!wf_public) {
            this.setState({user, wf_public, wf_admin, wf_censor, wf_ingest, wf_aricha, wf_dgima, wf_insert, wf_external,wf_upload,wf_jobs,wf_sirtutim});
            if(!wf_ingest) {
                setInterval(() => getData('state/langcheck', (data) => {
                    let count = Object.keys(data).length;
                    if (this.state.count !== count)
                        this.setState({count})
                }), 10000 );
            }
        } else {
            alert("Access denied!");
            client.signoutRedirect();
        }
    };

    setCount = (count) => {
        this.setState({count});
    };

    render() {

        const {count,wf_public,wf_ingest,wf_censor,wf_admin,wf_aricha,wf_dgima,wf_insert,wf_external,wf_upload,wf_jobs,wf_sirtutim,user} = this.state;

        let login = (<LoginPage user={user} checkPermission={this.checkPermission} />);
        let l = (<Label key='Carbon' floating circular size='mini' color='red'>{count}</Label>);

        const MonitorApp = lazy(() => import("./apps/Monitor/MonitorApp"));
        const IngestApp = lazy(() => import("./apps/Ingest/IngestApp"));
        const CensorApp = lazy(() => import("./apps/Censor/CensorApp"));
        const AdminApp = lazy(() => import("./apps/Admin/AdminApp"));
        const ArichaApp = lazy(() => import("./apps/Aricha/ArichaApp"));
        const DgimaApp = lazy(() => import("./apps/Dgima/DgimaApp"));
        const WFDB = lazy(() => import("./apps/WFDB/WFDB"));
        const CarbonApp = lazy(() => import("./apps/Carbon/CarbonApp"));
        const UploadApp = lazy(() => import("./apps/Upload/UploadApp"));
        const MetusApp = lazy(() => import("./apps/Metus/MetusApp"));
        const ExternalApp = lazy(() => import("./apps/External/ExternalApp"));
        const JobsApp = lazy(() => import("./apps/Jobs/JobsApp"));
        const SirtutimApp = lazy(() => import("./apps/Sirtutim/SirtutimApp"));
        const MainPage = lazy(() => import("./apps/Insert/MainPage"));

        const panes = [
            { menuItem: { key: 'Home', icon: 'home', content: 'Home', disabled: false },
                render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
            { menuItem: { key: 'sirtutim', icon: 'pencil alternate', content: 'Sirtutim', disabled: wf_sirtutim },
                render: () => <Tab.Pane attached={false} ><SirtutimApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'carbon', icon: 'settings', content: <div>Carbon{count > 0 ? l : ""}</div>, disabled: wf_ingest },
                render: () => <Tab.Pane attached={false} ><CarbonApp user={user} admin={wf_admin}/></Tab.Pane> },
            { menuItem: { key: 'ingest', icon: 'record', content: 'Ingest', disabled: wf_ingest },
                render: () => <Tab.Pane attached={false} ><IngestApp user={user} admin={wf_admin} /></Tab.Pane> },
            { menuItem: { key: 'censor', icon: 'copyright', content: 'Censor', disabled: wf_censor },
                render: () => <Tab.Pane attached={false} ><CensorApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'admin', icon: 'detective', content: 'Admin', disabled: wf_admin },
                render: () => <Tab.Pane attached={false} ><AdminApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'monitor', icon: 'eye', content: 'Monitor', disabled: wf_ingest },
                render: () => <Tab.Pane attached={false} ><MonitorApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'products', icon: 'shopping cart', content: 'Product', disabled: wf_jobs },
                render: () => <Tab.Pane attached={false} ><JobsApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'aricha', icon: 'edit', content: 'Aricha', disabled: wf_aricha },
                render: () => <Tab.Pane attached={false} ><ArichaApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'dgima', icon: 'film', content: 'Dgima', disabled: wf_dgima },
                render: () => <Tab.Pane attached={false} ><DgimaApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'external', icon: 'download', content: 'External', disabled: wf_external },
                render: () => <Tab.Pane attached={false} ><ExternalApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'insert', icon: 'archive', content: 'Insert', disabled: wf_insert },
                render: () => <Tab.Pane attached={false} ><MainPage user={user} /></Tab.Pane> },
            { menuItem: { key: 'upload', icon: 'upload', content: 'Upload', disabled: wf_upload },
                render: () => <Tab.Pane attached={false} ><UploadApp user={user} /></Tab.Pane> },
            { menuItem: { key: 'metus', icon: 'braille', content: 'Metus', disabled: wf_admin },
                render: () => <Tab.Pane attached={false} ><MetusApp user={this.state.user} /></Tab.Pane> },
            { menuItem: { key: 'wfdb', icon: 'heartbeat', content: 'Status', disabled: wf_admin},
                render: () => <Tab.Pane attached={false} ><WFDB user={user} /></Tab.Pane> },
        ];

        const wf_panes = panes.filter(p => !p.menuItem.disabled);

        return (
            <Suspense fallback={<div>Loading...</div>}>
                <Tab menu={{ secondary: true, pointing: true, color: "blue" }} panes={wf_panes} />
            </Suspense>
        );
    }
}

export default App;
