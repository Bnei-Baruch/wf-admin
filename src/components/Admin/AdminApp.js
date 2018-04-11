import React, {Component, Fragment} from 'react'
import AdminTrimmer from "../Trimmer/AdminTrimmer";
import AdminTrimmed from "./AdminTrimmed";

class AdminApp extends Component {

    state = {
        ival: null,
    };

    componentDidMount() {
        console.log("-- AdminApp mount");
    };

    componentWillUnmount() {
        console.log("-- AdminApp unmount");
    };

    render() {

        return (
            <Fragment>
                <AdminTrimmer/>
                <AdminTrimmed/>
            </Fragment>
        );
    }
}

export default AdminApp;