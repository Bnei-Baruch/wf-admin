import React, {Component, Fragment} from 'react'
import FilesWorkflow from "./FilesWorkflow";
import '../WFDB/WFDB.css';

class FilesApp extends Component {

    state = {
        ival: null,
    };

    render() {

        return (
            <Fragment>
                <FilesWorkflow user={this.props.user} />
            </Fragment>
        );
    }
}

export default FilesApp;