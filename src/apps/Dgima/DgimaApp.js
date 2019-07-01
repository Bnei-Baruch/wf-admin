import React, {Component, Fragment} from 'react'
import DgimaTrimmer from "../Trimmer/DgimaTrimmer";
import DgimaTrimmed from "./DgimaTrimmed";

class DgimaApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                <DgimaTrimmer/>
                <DgimaTrimmed user={this.props.user} />
            </Fragment>
        );
    }
}

export default DgimaApp;