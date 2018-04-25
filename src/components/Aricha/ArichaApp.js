import React, {Component, Fragment} from 'react'
import AchareyAricha from "./AchareyAricha";
import ArichaUpload from "./ArichaUpload";
import {putData} from "../../shared/tools";

class ArichaApp extends Component {

    state = {
        ival: null,
    };

    arichaWorkflow = (filedata) => {
        console.log(":: ArichaApp - got data: ", filedata);
        putData(`http://wfserver.bbdomain.org:8010/workflow/aricha`, filedata, (cb) => {
            console.log(":: ArichaApp - workflow respond: ",cb);
        });
    };

    render() {

        return (
            <Fragment>
                <ArichaUpload onFileData={this.arichaWorkflow}/>
                <AchareyAricha user={this.props.user} />
            </Fragment>
        );
    }
}

export default ArichaApp;