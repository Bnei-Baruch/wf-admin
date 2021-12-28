import React, {Component, Fragment} from 'react'
import {WFSRV_BACKEND, putData, getData, IVAL} from "../../shared/tools";
import ProductJob from "./ProductJob";
import {kc} from "../../components/UserManager";
import {Tab} from "semantic-ui-react";
import CloudFiles from "./CloudFiles";
import '../WFDB/WFDB.css';
import UsersJob from "./UsersJob";
import BoardJob from "./BoardJob";

class JobsApp extends Component {

    state = {
        job_id: false,
        tab: "metadata",
        users: [],
        user: {
            user_id: this.props.user.sub,
            name: this.props.user.name,
            email: this.props.user.email,
            adminer: !kc.hasRealmRole("wf_jobs_admin"),
            editor: !kc.hasRealmRole("wf_jobs_editor"),
            viewer: !kc.hasRealmRole("wf_jobs_viewer"),
        }
    };

    componentDidMount() {
        this.getUsers();
    };

    getUsers = () => {
        getData('users', (users) => {
            this.setState({users})
        });
    };

    jobWorkflow = (filedata) => {
        filedata.archive_type = "product";
        filedata.job_id = this.state.job_id;
        filedata.timestamp = Date.now()
        console.log(":: JobsApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/jobs`, filedata, (cb) => {
            console.log(":: JobsApp - workflow respond: ",cb);
            this.setState({job_id: null})
        });
    };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        this.setState({tab});
    };

    masterUpload = (job_id) => {
        job_id = job_id === this.state.job_id ? false : job_id;
        this.setState({job_id})
    };

    render() {
        let {adminer, editor} = this.state.user;

        if(kc.hasRealmRole("wf_root")) {
            adminer = false; editor = false;
        }

        const panes = [
            { menuItem: { key: 'Home', content: 'Board', disabled: false },
                render: () => <Tab.Pane attached={true} ><BoardJob {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'jobs', content: 'Admin', disabled: adminer},
                render: () => <Tab.Pane><ProductJob {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'files', content: 'Files', disabled: editor },
                render: () => <Tab.Pane ><CloudFiles {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'users', content: 'Users', disabled: adminer },
                render: () => <Tab.Pane ><UsersJob {...this.state} getUsers={this.getUsers} /></Tab.Pane> },
        ]

        return (
            <Fragment>
                {/*{this.state.job_id ? <ProductUpload onFileData={this.jobWorkflow} /> : ''}*/}
                {/*<ProductJob user={this.props.user} masterUpload={this.masterUpload} />*/}
                <Tab menu={{ pointing: true }} panes={panes} onTabChange={this.selectTab} />
            </Fragment>
        );
    }
}

export default JobsApp;
