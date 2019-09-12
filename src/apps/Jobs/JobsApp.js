import React, {Component, Fragment} from 'react'
import {WFSRV_BACKEND, putData} from "../../shared/tools";
import ProductJob from "./ProductJob";
import ProductUpload from "./ProductUpload";

class JobsApp extends Component {

    state = {
        ival: null,
        job_id: false,
    };

    jobWorkflow = (filedata) => {
        filedata.archive_type = "product";
        console.log(":: JobsApp - got data: ", filedata);
        filedata.job_id = this.state.job_id;
        putData(`${WFSRV_BACKEND}/workflow/jobs`, filedata, (cb) => {
            console.log(":: JobsApp - workflow respond: ",cb);
            this.setState({job_id: null})
        });
    };

    masterUpload = (job_id) => {
        job_id = job_id === this.state.job_id ? false : job_id;
        this.setState({job_id})
    };

    render() {

        return (
            <Fragment>
                {this.state.job_id ? <ProductUpload onFileData={this.jobWorkflow} /> : ''}
                <ProductJob user={this.props.user} masterUpload={this.masterUpload} />
            </Fragment>
        );
    }
}

export default JobsApp;