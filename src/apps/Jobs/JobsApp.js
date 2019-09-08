import React, {Component, Fragment} from 'react'
import {WFSRV_BACKEND, putData} from "../../shared/tools";
import ProductJob from "./ProductJob";
import ProductUpload from "./ProductUpload";

class JobsApp extends Component {

    state = {
        ival: null,
    };

    jobWorkflow = (filedata) => {
        console.log(":: JobsApp - got data: ", filedata);
        // putData(`${WFSRV_BACKEND}/workflow/aricha`, filedata, (cb) => {
        //     console.log(":: ArichaApp - workflow respond: ",cb);
        // });
    };

    render() {

        return (
            <Fragment>
                <ProductUpload onFileData={this.jobWorkflow} />
                <ProductJob />
            </Fragment>
        );
    }
}

export default JobsApp;