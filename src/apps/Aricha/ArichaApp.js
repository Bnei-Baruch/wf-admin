import React, {Component, Fragment} from 'react'
import ArichaAdmin from "./ArichaAdmin";
import ArichaUpload from "./ArichaUpload";
import {WFSRV_BACKEND, putData} from "../../shared/tools";

class ArichaApp extends Component {

    state = {
        ival: null,
    };

    arichaWorkflow = (filedata) => {
        console.log(":: ArichaApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/aricha`, filedata, (cb) => {
            console.log(":: ArichaApp - workflow respond: ",cb);
        });
    };

    render() {

        return (
            <Fragment>
                <ArichaUpload onFileData={this.arichaWorkflow}/>
                <ArichaAdmin user={this.props.user} />
            </Fragment>
        );
    }
}

export default ArichaApp;