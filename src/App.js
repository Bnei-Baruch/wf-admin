import React, { Component, lazy, Suspense } from 'react';
import { Tab, Label, Segment } from 'semantic-ui-react'
import {client} from "./components/UserManager";
import {getData} from "./shared/tools";
import LoginPage from './components/LoginPage';
import './stylesheets/sematic-reset.css';
import './stylesheets/scoped_semantic_ltr.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

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
const InsertApp = lazy(() => import("./apps/Insert/InsertApp"));
const KtaimApp = lazy(() => import("./apps/Ktaim/KtaimApp"));
const FilesApp = lazy(() => import("./apps/Files/FilesApp"));

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
        wf_ktaim: true,
        wf_files: true,
        wf_panes: []
    };

    componentDidMount() {
        this.loadApps();
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
        let wf_ktaim = user.roles.filter(role => role === 'wf_ktaim').length === 0;
        let wf_files = user.roles.filter(role => role === 'wf_files').length === 0;
        if(!wf_public) {
            this.setState({user,wf_public,wf_admin,wf_censor,wf_ingest,wf_aricha,wf_dgima,wf_insert,wf_external,wf_upload,wf_jobs,wf_sirtutim,wf_ktaim,wf_files}, () => {
                this.loadApps();
            });
            if(!wf_ingest) {
                setInterval(() => getData('state/langcheck', (data) => {
                    let count = Object.keys(data).length;
                    if (this.state.count !== count) {
                        let {wf_panes} = this.state;
                        for(let i=0; i<wf_panes.length; i++) {
                            if(wf_panes[i].menuItem.key === "carbon") {
                                let l = (<Label key='Carbon' floating circular size='mini' color='red'>{count}</Label>);
                                wf_panes[i].menuItem.content = <div>Carbon{count > 0 ? l : ""}</div>;
                                this.setState({wf_panes,count})
                            }
                        }
                    }
                }), 10000 );
            }
        } else {
            alert("Access denied!");
            client.signoutRedirect();
        }
    };

    loadApps = () => {
        const {wf_ingest,wf_censor,wf_admin,wf_aricha,wf_dgima,wf_insert,wf_external,wf_upload,wf_jobs,wf_sirtutim,wf_ktaim,wf_files,user} = this.state;

        let login = (<Suspense fallback={<Segment loading size='massive' />}><LoginPage user={user} checkPermission={this.checkPermission} /></Suspense>);
        let sirtutim = (<Suspense fallback={<Segment loading size='massive' />}><SirtutimApp user={user} /></Suspense>);
        let carbon = (<Suspense fallback={<Segment loading size='massive' />}><CarbonApp user={user} admin={wf_admin}/></Suspense>);
        let ktaim = (<Suspense fallback={<Segment loading size='massive' />}><KtaimApp user={user} /></Suspense>);
        let files = (<Suspense fallback={<Segment loading size='massive' />}><FilesApp user={user} /></Suspense>);
        let ingest = (<Suspense fallback={<Segment loading size='massive' />}><IngestApp user={user} admin={wf_admin} /></Suspense>);
        let censor = (<Suspense fallback={<Segment loading size='massive' />}><CensorApp user={user} /></Suspense>);
        let admin = (<Suspense fallback={<Segment loading size='massive' />}><AdminApp user={user} /></Suspense>);
        let monitor = (<Suspense fallback={<Segment loading size='massive' />}><MonitorApp user={user} /></Suspense>);
        let jsobs = (<Suspense fallback={<Segment loading size='massive' />}><JobsApp user={user} /></Suspense>);
        let aricha = (<Suspense fallback={<Segment loading size='massive' />}><ArichaApp user={user} /></Suspense>);
        let dgima= (<Suspense fallback={<Segment loading size='massive' />}><DgimaApp user={user} /></Suspense>);
        let external = (<Suspense fallback={<Segment loading size='massive' />}><ExternalApp user={user} /></Suspense>);
        let mainpage = (<Suspense fallback={<Segment loading size='massive' />}><InsertApp user={user} /></Suspense>);
        let upload = (<Suspense fallback={<Segment loading size='massive' />}><UploadApp user={user} /></Suspense>);
        let metus = (<Suspense fallback={<Segment loading size='massive' />}><MetusApp user={user} /></Suspense>);
        let wfdb = (<Suspense fallback={<Segment loading size='massive' />}><WFDB user={user} /></Suspense>);


        const panes = [
            { menuItem: { key: 'Home', icon: 'home', content: 'Home', disabled: false },
                render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
            { menuItem: { key: 'files', icon: 'folder open', content: 'Files', disabled: wf_files },
                render: () => <Tab.Pane attached={false} >{files}</Tab.Pane> },
            { menuItem: { key: 'sirtutim', icon: 'pencil', content: 'Sirtutim', disabled: wf_sirtutim },
                render: () => <Tab.Pane attached={false} >{sirtutim}</Tab.Pane> },
            { menuItem: { key: 'carbon', icon: 'settings', content: 'Carbon', disabled: wf_ingest },
                render: () => <Tab.Pane attached={false} >{carbon}</Tab.Pane> },
            { menuItem: { key: 'ktaim', icon: 'newspaper', content: 'Ktaim', disabled: wf_ktaim },
                render: () => <Tab.Pane attached={false} >{ktaim}</Tab.Pane> },
            { menuItem: { key: 'ingest', icon: 'record', content: 'Ingest', disabled: wf_ingest },
                render: () => <Tab.Pane attached={false} >{ingest}</Tab.Pane> },
            { menuItem: { key: 'censor', icon: 'copyright', content: 'Censor', disabled: wf_censor },
                render: () => <Tab.Pane attached={false} >{censor}</Tab.Pane> },
            { menuItem: { key: 'admin', icon: 'detective', content: 'Admin', disabled: wf_admin },
                render: () => <Tab.Pane attached={false} >{admin}</Tab.Pane> },
            { menuItem: { key: 'monitor', icon: 'eye', content: 'Monitor', disabled: wf_ingest },
                render: () => <Tab.Pane attached={false} >{monitor}</Tab.Pane> },
            { menuItem: { key: 'products', icon: 'shopping cart', content: 'Product', disabled: wf_jobs },
                render: () => <Tab.Pane attached={false} >{jsobs}</Tab.Pane> },
            { menuItem: { key: 'aricha', icon: 'edit', content: 'Aricha', disabled: wf_aricha },
                render: () => <Tab.Pane attached={false} >{aricha}</Tab.Pane> },
            { menuItem: { key: 'dgima', icon: 'film', content: 'Dgima', disabled: wf_dgima },
                render: () => <Tab.Pane attached={false} >{dgima}</Tab.Pane> },
            { menuItem: { key: 'external', icon: 'download', content: 'External', disabled: wf_external },
                render: () => <Tab.Pane attached={false} >{external}</Tab.Pane> },
            { menuItem: { key: 'insert', icon: 'archive', content: 'Insert', disabled: wf_insert },
                render: () => <Tab.Pane attached={false} >{mainpage}</Tab.Pane> },
            { menuItem: { key: 'upload', icon: 'upload', content: 'Upload', disabled: wf_upload },
                render: () => <Tab.Pane attached={false} >{upload}</Tab.Pane> },
            { menuItem: { key: 'metus', icon: 'braille', content: 'Metus', disabled: wf_admin },
                render: () => <Tab.Pane attached={false} >{metus}</Tab.Pane> },
            { menuItem: { key: 'wfdb', icon: 'heartbeat', content: 'Status', disabled: wf_admin},
                render: () => <Tab.Pane attached={false} >{wfdb}</Tab.Pane> },
        ];

        const wf_panes = panes.filter(p => !p.menuItem.disabled);
        this.setState({wf_panes})
    };

    render() {
        const {wf_panes} = this.state;

        return (
            <Tab menu={{ secondary: true, pointing: true, color: "blue" }} panes={wf_panes} />
        );
    }
}

export default App;
