import React, {Component, Fragment} from 'react'
//import CensorTrimmer from "../Trimmer/CensorTrimmer";
import CensorCheck from "./CensorCheck";

class CensorApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                {/*<CensorTrimmer/>*/}
                <CensorCheck user={this.props.user} />
            </Fragment>
        );
    }
}

export default CensorApp;