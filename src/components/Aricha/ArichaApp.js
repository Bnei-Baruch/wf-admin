import React, {Component, Fragment} from 'react'
import AchareyAricha from "./AchareyAricha";
import ArichaUpload from "./ArichaUpload";

class AdminApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                <ArichaUpload />
                <AchareyAricha />
            </Fragment>
        );
    }
}

export default AdminApp;