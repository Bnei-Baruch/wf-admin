import React, {Component, Fragment} from 'react'
import MetusDB from "./MetusDB";

class MetusApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                <MetusDB/>
            </Fragment>
        );
    }
}

export default MetusApp;