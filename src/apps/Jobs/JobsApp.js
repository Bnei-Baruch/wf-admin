import React, {Component, Fragment} from 'react'
import {WFSRV_BACKEND, putData} from "../../shared/tools";
import ProductJob from "./ProductJob";

class JobsApp extends Component {

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
                <ProductJob />
            </Fragment>
        );
    }
}

export default JobsApp;