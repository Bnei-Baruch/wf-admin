import React, {Component, Fragment} from 'react'
import LangCheck from "./LangCheck";
import MonitorCarbon from "./MonitorCarbon";

class CarbonApp extends Component {

    state = {
        carbon: {},
    };

    render() {

        return (
            <Fragment>
                <LangCheck  />
                <MonitorCarbon/>
            </Fragment>
        );
    }
}

export default CarbonApp;