import React, {Component, Fragment} from 'react'
import DgimaUpload from "./DgimaUpload";
import DgimaTrimmer from "../Trimmer/DgimaTrimmer";
import DgimaTrimmed from "./DgimaTrimmed";
import {putData, WFSRV_BACKEND} from "../../shared/tools";

class DgimaApp extends Component {

    state = {
        ival: null,
    };

    dgimaWorkflow = (filedata) => {
        console.log(":: DgimaApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/dgima`, filedata, (cb) => {
            console.log(":: DgimaApp - workflow respond: ",cb);
        });
    };

    render() {

        return (
            <Fragment>
                {this.props.user.preferred_username.match(/^(amnonbb@gmail\.com|natashazh57@gmail\.com)$/) ? <DgimaUpload onFileData={this.dgimaWorkflow}/> : ""}
                <DgimaTrimmer/>
                <DgimaTrimmed/>
            </Fragment>
        );
    }
}

export default DgimaApp;