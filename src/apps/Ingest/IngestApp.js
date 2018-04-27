import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestTrimmer from "../Trimmer/IngestTrimmer";
import LangSelector from "../../components/LangSelector";

class IngestApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                <IngestTrimmer />
                <IngestTrimmed />
                <LangSelector />
            </Fragment>
        );
    }
}

export default IngestApp;