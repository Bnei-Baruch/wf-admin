import React, {Component, Fragment} from 'react'
import AkladaUpload from "./AkladaUpload";
import BackupUpload from "./BackupUpload";
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

    backupWorkflow = (filedata) => {
        filedata.archive_type = "backup";
        filedata.source = "upload";
        filedata.source_path = "/backup/upload/backup";
        console.log(":: UploadApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/upload`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
        });
    };

    render() {

        return (
            <Fragment>
                {this.props.user.preferred_username.match(/^(amnonbb@gmail\.com|natashazh57@gmail\.com)$/) ? <BackupUpload onFileData={this.backupWorkflow} /> : ""}
                <AkladaUpload onFileData={this.akladaWorkflow}/>
            </Fragment>
        );
    }
}

export default UploadApp;