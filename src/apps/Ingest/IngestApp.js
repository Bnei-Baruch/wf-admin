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
                <IngestTrimmer />
                <IngestTrimmed />
                <LangSelector onRef={ref => (this.LangSelector = ref)} onGetLangs={this.setLangs} />
                <button onClick={() => this.LangSelector.getLangs()}>Get Langs</button>
            </Fragment>
        );
    }
}

export default IngestApp;