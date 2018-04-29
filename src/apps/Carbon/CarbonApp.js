import React, {Component, Fragment} from 'react'
import LangCheck from "./LangCheck";

class CarbonApp extends Component {

    state = {
        carbon: {},
    };

    render() {

        return (
            <Fragment>
                <LangCheck  />
            </Fragment>
        );
    }
}

export default CarbonApp;