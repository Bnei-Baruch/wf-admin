import React, {Component, Fragment} from 'react'
import AchareyAricha from "./AchareyAricha";
import ArichaUpload from "./ArichaUpload";

class AdminApp extends Component {

    state = {
        ival: null,
    };

    componentDidMount() {
        console.log("-- ArichaApp mount");
    };

    componentWillUnmount() {
        console.log("-- ArichaApp unmount");
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