import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestCaptured from "./IngestCaptured";

class IngestApp extends Component {

    state = {
        ival: null,
    };

    componentDidMount() {
        console.log("-- IngestApp mount");
    };

    componentWillUnmount() {
        console.log("-- IngestApp unmount");
    };

    render() {

        return (
            <Fragment>
                <IngestCaptured/>
                <IngestTrimmed />
            </Fragment>
        );
    }
}

export default IngestApp;