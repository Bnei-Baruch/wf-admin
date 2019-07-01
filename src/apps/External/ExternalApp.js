import React, {Component, Fragment} from 'react'
import ExternalUpload from "./ExternalUpload";
import ExternalTrimmed from "./ExternalTrimmed";
import {captureSha, putData, WFSRV_BACKEND} from "../../shared/tools";
import ExternalTrimmer from "../Trimmer/ExternalTrimmer";

class ExternalApp extends Component {

    state = {
        ival: null,
    };

    dgimaWorkflow = (filedata) => {
        console.log(":: DgimaApp - got data: ", filedata);
        captureSha(filedata.sha1, (data) => {
            console.log(":: Check captured sha: ",data);
            if(data.length > 0) {
                alert("File already exist!")
                //TODO: make option to autoselect exist file
            } else {
                putData(`${WFSRV_BACKEND}/workflow/dgima`, filedata, (cb) => {
                    console.log(":: DgimaApp - workflow respond: ",cb);
                });
            }
        });
    };

    render() {

        return (
            <Fragment>
                <ExternalUpload onFileData={this.dgimaWorkflow}/>
                <ExternalTrimmer/>
                <ExternalTrimmed user={this.props.user} />
            </Fragment>
        );
    }
}

export default ExternalApp;