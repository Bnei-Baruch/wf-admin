import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestTrimmer from "../Trimmer/IngestTrimmer";
import IngestPresets from "./IngestPresets";
//import LangSelector from "../../components/LangSelector";

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
                {/*<LangSelector onGetLangs={this.setLangs} />*/}
                {this.props.admin ? "" : <IngestPresets />}
                <IngestTrimmer />
                <IngestTrimmed />
            </Fragment>
        );
    }
}

export default IngestApp;