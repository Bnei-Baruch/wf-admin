import React, {Component, Fragment} from 'react'
import AkladaUpload from "./AkladaUpload";
import BackupUpload from "./BackupUpload";
import {WFSRV_BACKEND, putData, getLocalUpload} from "../../shared/tools";
import RawUpload from "./RawUpload";
import {Tab} from "semantic-ui-react";
import mqtt from "../../shared/mqtt";
import MonitorUpload from "../Monitor/MonitorUpload";

class UploadApp extends Component {

    state = {
        tab: "backup",
        ival: null,
        upload_topic: "",
        local: ["", ""],
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.upload_topic);
    };

    initMQTT = () => {
        const upload_topic = 'workflow/server/local/upload';
        this.setState({upload_topic})
        mqtt.join(upload_topic);
        mqtt.watch((message, type, source) => {
            console.log("[Upload] Got msg: ", message, " | from: " + source, " | type: " + type);
            this.setState({[type]: message})
        }, true)
    };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        if(tab === "upload") {
            getLocalUpload(() => {})
        }
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
            { menuItem: { key: 'upload', content: 'Monitor', disabled: false},
                render: () => <Tab.Pane attached ><MonitorUpload upload={this.state.local} /></Tab.Pane> },
        ]

        return (
            <Fragment>
                <Tab menu={{ pointing: true }} panes={panes} onTabChange={this.selectTab} />
            </Fragment>
        );
    }
}

export default UploadApp;
