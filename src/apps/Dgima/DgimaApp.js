import React, {Component, Fragment} from 'react'
import DgimaUpload from "./DgimaUpload";
import DgimaTrimmer from "../Trimmer/DgimaTrimmer";
import DgimaTrimmed from "./DgimaTrimmed";
import {DGIMA_BACKEND, putData} from "../../shared/tools";

class DgimaApp extends Component {

    state = {
        ival: null,
    };

    dgimaWorkflow = (filedata) => {
        console.log(":: DgimaApp - got data: ", filedata);
        putData(`${DGIMA_BACKEND}/workflow/dgima`, filedata, (cb) => {
            console.log(":: DgimaApp - workflow respond: ",cb);
        });
    };

    render() {

        return (
            <Fragment>
                <DgimaUpload onFileData={this.dgimaWorkflow}/>
                <DgimaTrimmer/>
                <DgimaTrimmed/>
            </Fragment>
        );
    }
}

export default DgimaApp;