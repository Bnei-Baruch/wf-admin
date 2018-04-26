import React, {Component, Fragment} from 'react'
import CensorTrimmer from "../Trimmer/CensorTrimmer";
import CensorTrimmed from "./CensorTrimmed";

class CensorApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                <CensorTrimmer/>
                <CensorTrimmed/>
            </Fragment>
        );
    }
}

export default CensorApp;