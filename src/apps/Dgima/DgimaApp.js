import React, {Component, Fragment} from 'react'
import DgimaUpload from "./DgimaUpload";
import DgimaTrimmer from "../Trimmer/DgimaTrimmer";
import DgimaTrimmed from "./DgimaTrimmed";
import {captureSha, putData, WFSRV_BACKEND} from "../../shared/tools";

class DgimaApp extends Component {

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
                {this.props.user.preferred_username.match(/^(amnonbb@gmail\.com|natashazh57@gmail\.com|alex\.mizrachi@gmail\.com)$/) ? <DgimaUpload onFileData={this.dgimaWorkflow}/> : ""}
                <DgimaTrimmer/>
                <DgimaTrimmed user={this.props.user} />
            </Fragment>
        );
    }
}

export default DgimaApp;