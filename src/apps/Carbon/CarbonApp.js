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
                <LangCheck />
                <CarbonState user={this.props.user} admin={this.props.admin} />
            </Fragment>
        );
    }
}

export default CarbonApp;