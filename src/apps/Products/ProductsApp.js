import React, {Component, Fragment} from 'react'
import moment from 'moment';
import {WFSRV_BACKEND, putData} from "../../shared/tools";
import ProductsAdmin from "./ProductsAdmin";
import ProductUpload from "./ProductUpload";

class ProductsApp extends Component {

    state = {
        ival: null,
        job_id: false,
    };

    jobWorkflow = (filedata) => {
        filedata.archive_type = "product";
        filedata.job_id = this.state.job_id;
        filedata.timestamp = moment().format('x');
        console.log(":: JobsApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/products`, filedata, (cb) => {
            console.log(":: JobsApp - workflow respond: ",cb);
            this.setState({job_id: null})
        });
    };

    masterUpload = (job_id) => {
        job_id = job_id === this.state.job_id ? false : job_id;
        this.setState({job_id})
    };

    render() {

        return (
            <Fragment>
                {this.state.job_id ? <ProductUpload onFileData={this.jobWorkflow} /> : ''}
                <ProductsAdmin user={this.props.user} masterUpload={this.masterUpload} />
            </Fragment>
        );
    }
}

export default ProductsApp;