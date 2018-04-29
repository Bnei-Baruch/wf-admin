import React, {Component, Fragment} from 'react'
import LangCheck from "./LangCheck";
import CarbonState from "./CarbonState";

class CarbonApp extends Component {

    state = {
        carbon: {},
    };

    render() {

        return (
            <Fragment>
                <LangCheck  />
                <CarbonState/>
            </Fragment>
        );
    }
}

export default CarbonApp;