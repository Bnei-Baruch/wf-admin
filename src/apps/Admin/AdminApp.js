import React, {Component, Fragment} from 'react'
import AdminTrimmer from "../Trimmer/AdminTrimmer";
import AdminTrimmed from "./AdminTrimmed";

class AdminApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                <AdminTrimmer/>
                <AdminTrimmed user={this.props.user} />
            </Fragment>
        );
    }
}

export default AdminApp;