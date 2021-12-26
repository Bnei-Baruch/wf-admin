import React, {Component, Fragment} from 'react'
import {WFSRV_BACKEND, putData} from "../../shared/tools";
import ProductJob from "./ProductJob";
import {kc} from "../../components/UserManager";
import {Tab} from "semantic-ui-react";
import CloudFiles from "./CloudFiles";

class JobsApp extends Component {

    state = {
        job_id: false,
        tab: "metadata",
        user: {
            name: this.props.user.name,
            email: this.props.user.email,
            rooter: kc.hasRealmRole("wf_jobs_root"),
            adminer: kc.hasRealmRole("wf_jobs_admin"),
            archer: kc.hasRealmRole("wf_jobs_archive"),
            viewer: kc.hasRealmRole("wf_jobs_viewer"),
        }
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

        const panes = [
            { menuItem: { key: 'jobs', content: 'Jobs', disabled: false},
                render: () => <Tab.Pane attached ><ProductJob {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'files', content: 'Files', disabled: false },
                render: () => <Tab.Pane ><CloudFiles {...this.state} /></Tab.Pane> },
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
