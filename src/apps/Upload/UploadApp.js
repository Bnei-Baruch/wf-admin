import React, {Component, Fragment} from 'react'
import AkladaUpload from "./AkladaUpload";
import BackupUpload from "./BackupUpload";
import {WFSRV_BACKEND, putData} from "../../shared/tools";
import RawUpload from "./RawUpload";
import {Tab} from "semantic-ui-react";

class UploadApp extends Component {

    state = {
        tab: "backup",
        ival: null,
    };

    // componentDidMount() {
    //     let files_product = !kc.hasRealmRole("wf_products_root");
    //     this.setState({files_product});
    // };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        this.setState({tab});
    };

    akladaWorkflow = (filedata) => {
        filedata.archive_type = "akladot";
        filedata.source = "upload";
        filedata.source_path = "/backup/tmp/akladot";
        console.log(":: UploadApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/upload`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
        });
    };

    backupWorkflow = (filedata) => {
        filedata.archive_type = "backup";
        filedata.source = "upload";
        filedata.source_path = "/backup/upload/backup";
        console.log(":: UploadApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/upload`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
        });
    };

    rawWorkflow = (filedata) => {
        filedata.archive_type = "raw";
        filedata.source = "upload";
        filedata.source_path = "/backup/tmp/upload";
        console.log(":: UploadApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/upload`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
        });
    };

    render() {

        const panes = [
            { menuItem: { key: 'backup', content: 'Backup', disabled: false},
                render: () => <Tab.Pane attached ><BackupUpload onFileData={this.backupWorkflow} /></Tab.Pane> },
            { menuItem: { key: 'cloud', content: 'Cloud', disabled: false},
                render: () => <Tab.Pane attached ><RawUpload onFileData={this.rawWorkflow} /></Tab.Pane> },
            { menuItem: { key: 'akladot', content: 'Akladot', disabled: false},
                render: () => <Tab.Pane attached ><AkladaUpload onFileData={this.akladaWorkflow} /></Tab.Pane> },
        ]

        return (
            <Fragment>
                <Tab menu={{ pointing: true }} panes={panes} onTabChange={this.selectTab} />
            </Fragment>
        );
    }
}

export default UploadApp;
