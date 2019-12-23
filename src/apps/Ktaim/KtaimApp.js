import React, {Component, Fragment} from 'react'
import KtaimTrimmed from "./KtaimTrimmed";
import KtaimTrimmer from "../Trimmer/KtaimTrimmer";

class KtaimApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                <KtaimTrimmer />
                <KtaimTrimmed />
            </Fragment>
        );
    }
}

export default KtaimApp;