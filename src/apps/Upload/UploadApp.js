import React, {Component, Fragment} from 'react'
import AkladaUpload from "./AkladaUpload";
import {WFSRV_BACKEND, putData} from "../../shared/tools";

class UploadApp extends Component {

    state = {
        ival: null,
    };

    akladaWorkflow = (filedata) => {
        filedata.archive_type = "akladot";
        filedata.source = "upload";
        filedata.source_path = "/backup/tmp/akladot";
        console.log(":: UploadApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/upload`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
        });
    };

    render() {

        return (
            <Fragment>
                <AkladaUpload onFileData={this.akladaWorkflow}/>
            </Fragment>
        );
    }
}

export default UploadApp;