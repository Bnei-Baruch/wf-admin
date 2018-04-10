import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestCaptured from "./IngestCaptured";
import IngestTrimmer from "../Trimmer/IngestTrimmer";

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
                <IngestTrimmer />
                <IngestTrimmed />
            </Fragment>
        );
    }
}

export default IngestApp;