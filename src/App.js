import React, { Component, lazy, Suspense } from 'react';
import { Tab, Label } from 'semantic-ui-react'
import {kc} from "./components/UserManager";
import mqtt from "./shared/mqtt";
import LoginPage from './components/LoginPage';
import 'semantic-ui-css/semantic.min.css'
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
const ProductsApp = lazy(() => import("./apps/Products/ProductsApp"));
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
        wf_products:true,
        wf_panes: []
    };

    componentDidMount() {
        this.loadApps();
    };

    checkPermission = (user) => {
        let wf_public = !kc.hasRealmRole("bb_user");
        let wf_ingest = !kc.hasRealmRole("wf_ingest");
        let wf_censor = !kc.hasRealmRole("wf_censor");
        let wf_admin = !kc.hasRealmRole("wf_admin");
        let wf_jobs = !kc.hasRealmRole("wf_jobs");
        let wf_aricha = !kc.hasRealmRole("wf_aricha");
        let wf_insert = !kc.hasRealmRole("wf_insert");
        let wf_dgima = !kc.hasRealmRole("wf_dgima");
        let wf_external = !kc.hasRealmRole("wf_external");
        let wf_upload = !kc.hasRealmRole("wf_upload");
        let wf_sirtutim = !kc.hasRealmRole("wf_sirtutim");
        let wf_ktaim = !kc.hasRealmRole("wf_ktaim");
        let wf_files = !kc.hasRealmRole("wf_files");
        let wf_products = !kc.hasRealmRole("wf_products");
        if(!wf_public) {
            this.setState({user,wf_public,wf_admin,wf_censor,wf_ingest,wf_aricha,wf_dgima,wf_insert,wf_external,wf_upload,wf_jobs,wf_sirtutim,wf_ktaim,wf_files,wf_products}, () => {
                this.loadApps();
                this.initMQTT(user, wf_ingest);
            });
        } else {
            alert("Access denied!");
            kc.logout();
        }
    };

    initMQTT = (user, wf_ingest) => {
        mqtt.init(user, (data) => {
            console.log("[mqtt] init: ", data);
            if(!wf_ingest) {
                const data = 'wf-api/service/langcheck/state';
                // const local = true;
                // const topic = local ? data : 'bb/' + data;
                const local = true;
                const topic = data
                this.setState({topic})
                // mqtt.join(topic);
                // mqtt.watch((message, type, source) => {
                //     if(type === "langcheck") {
                //         console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
                //         const count = Object.keys(message).filter(d => /t/.test(d)).length
                //         if (this.state.count !== count) {
                //             let {wf_panes} = this.state;
                //             for(let i=0; i<wf_panes.length; i++) {
                //                 if(wf_panes[i].menuItem.key === "carbon") {
                //                     let l = (<Label key='Carbon' floating circular size='mini' color='red'>{count}</Label>);
                //                     wf_panes[i].menuItem.content = <div>Carbon{count > 0 ? l : ""}</div>;
                //                     this.setState({wf_panes,count})
                //                 }
                //             }
                //         }
                //     }
                // }, local)
            }
        })
    };

    loadApps = () => {
        const {wf_ingest,wf_censor,wf_admin,wf_aricha,wf_dgima,wf_insert,wf_external,wf_upload,wf_jobs,wf_sirtutim,wf_ktaim,wf_files,wf_products,user} = this.state;

        const loading = (<Tab.Pane loading />);

        let login = (<Suspense fallback={loading}><LoginPage user={user} checkPermission={this.checkPermission} /></Suspense>);
        let sirtutim = (<Suspense fallback={loading}><SirtutimApp user={user} /></Suspense>);
        let carbon = (<Suspense fallback={loading}><CarbonApp user={user} admin={wf_admin}/></Suspense>);
        let ktaim = (<Suspense fallback={loading}><KtaimApp user={user} /></Suspense>);
        let files = (<Suspense fallback={loading}><FilesApp user={user} /></Suspense>);
        let ingest = (<Suspense fallback={loading}><IngestApp user={user} admin={wf_admin} /></Suspense>);
        let censor = (<Suspense fallback={loading}><CensorApp user={user} /></Suspense>);
        let admin = (<Suspense fallback={loading}><AdminApp user={user} /></Suspense>);
        let monitor = (<Suspense fallback={loading}><MonitorApp user={user} /></Suspense>);
        let jsobs = (<Suspense fallback={loading}><JobsApp user={user} /></Suspense>);
        let products = (<Suspense fallback={loading}><ProductsApp user={user} /></Suspense>);
        let aricha = (<Suspense fallback={loading}><ArichaApp user={user} /></Suspense>);
        let dgima= (<Suspense fallback={loading}><DgimaApp user={user} /></Suspense>);
        let external = (<Suspense fallback={loading}><ExternalApp user={user} /></Suspense>);
        let mainpage = (<Suspense fallback={loading}><InsertApp user={user} /></Suspense>);
        let upload = (<Suspense fallback={loading}><UploadApp user={user} /></Suspense>);
        let metus = (<Suspense fallback={loading}><MetusApp user={user} /></Suspense>);
        let wfdb = (<Suspense fallback={loading}><WFDB user={user} /></Suspense>);


        const panes = [
            { menuItem: { key: 'Home', icon: 'home', content: 'Home', disabled: false },
                render: () => <Tab.Pane attached={true} >{login}</Tab.Pane> },
            { menuItem: { key: 'files', icon: 'folder open', content: 'Files', disabled: wf_files },
                render: () => <Tab.Pane attached={false} >{files}</Tab.Pane> },
            { menuItem: { key: 'sirtutim', icon: 'pencil', content: 'Sirtutim', disabled: wf_sirtutim },
                render: () => <Tab.Pane attached={false} >{sirtutim}</Tab.Pane> },
            { menuItem: { key: 'carbon', icon: 'settings', content: 'Convert', disabled: wf_ingest },
                render: () => <Tab.Pane attached={false} >{carbon}</Tab.Pane> },
            { menuItem: { key: 'ktaim', icon: 'newspaper', content: 'Ktaim', disabled: wf_ktaim },
                render: () => <Tab.Pane attached={false} >{ktaim}</Tab.Pane> },
            { menuItem: { key: 'ingest', icon: 'record', content: 'Ingest', disabled: wf_ingest },
                render: () => <Tab.Pane attached={false} >{ingest}</Tab.Pane> },
            { menuItem: { key: 'censor', icon: 'copyright', content: 'Censor', disabled: wf_censor },
                render: () => <Tab.Pane attached={false} >{censor}</Tab.Pane> },
            { menuItem: { key: 'admin', icon: 'detective', content: 'Admin', disabled: wf_admin },
                render: () => <Tab.Pane attached={false} >{admin}</Tab.Pane> },
            { menuItem: { key: 'monitor', icon: 'eye', content: 'Monitor', disabled: false },
                render: () => <Tab.Pane attached={false} >{monitor}</Tab.Pane> },
            { menuItem: { key: 'jobs', icon: 'truck', content: 'Jobs', disabled: wf_jobs },
                render: () => <Tab.Pane attached={false} >{jsobs}</Tab.Pane> },
            { menuItem: { key: 'products', icon: 'shopping cart', content: 'Products', disabled: wf_products },
                render: () => <Tab.Pane attached={false} >{products}</Tab.Pane> },
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
