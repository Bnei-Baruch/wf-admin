import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestTrimmer from "../Trimmer/IngestTrimmer";
import LangSelector from "../../components/LangSelector";

class IngestApp extends Component {

    state = {
        ival: null,
    };

    setLangs = (langs) => {
        console.log(":: Got langs: ",langs);
    };

    render() {

        return (
            <Fragment>
                <LangSelector onGetLangs={this.setLangs} />
                <IngestTrimmer />
                <IngestTrimmed />
            </Fragment>
        );
    }
}

export default IngestApp;