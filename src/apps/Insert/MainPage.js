import React, {Component, Fragment} from 'react';
import { Modal } from 'semantic-ui-react';
import moment from 'moment';
import UploadFile from './UploadFile';
import LoginPage from './LoginPage';
import InsertApp from './InsertApp';
import {insertName,insertSha,putData} from '../../shared/tools';
import './InsertApp.css';

class App extends Component {

    state = {
        user: null,
        insert: null,
        filedata: null,
        open: false,
        loading: true,
    };

    setMode = (mode) => {
        console.log(":: Setting Mode:", mode);
        this.setState({insert: mode});
    };

    setFileData = (filedata) => {
        const {insert} = this.state;
        insertSha(filedata.sha1, (data) => {
            console.log(":: Got SHA1 check", data);
            if (data.total > 0 && insert === "1") {
                console.log(":: File with SHA1: " + filedata.sha1 + " - already exist!");
                alert("File already exist in MDB!");
            } else if (data.total > 0 && insert === "2") {
                console.log(":: File with SHA1: " + filedata.sha1 + " - already exist! - Set rename mode ::");
                this.setState({insert: "3"});
                this.setMetaData(filedata);
            } else {
                this.setMetaData(filedata);
            }
        });
    };

    setMetaData = (filedata) => {
        console.log(":: Setting metadata from:", filedata);
        const {sha1,size,filename,type,url} = filedata;
        let line = {content_type: null, upload_filename: filename, mime_type: type,
            url: `http://wfsrv.bbdomain.org/u/${url}`};
        let metadata = {sha1, size, line, content_type: null, language: null,
            send_uid: "", upload_type: "", insert_type: this.state.insert};

        // Extract and validate UID from filename
        let uid = filename.split(".")[0].split("_").pop();
        if(uid.length === 8 && (/[_]/).test(filename))
            metadata.send_uid = uid;

        // Extract and validate date from filename
        if((/\d{4}-\d{2}-\d{2}/).test(filedata.filename)) {
            let string_date = filedata.filename.match(/\d{4}-\d{2}-\d{2}/)[0];
            let test_date = moment(string_date);
            let date = test_date.isValid() ? string_date : moment().format('YYYY-MM-DD');
            metadata.date = date;
        }

        // If mode rename get insert workflow data
        if(this.state.insert === "3") {
            insertName(sha1, "sha1", (data) => {
                console.log(":: insert data - got: ",data);
                metadata.send_uid = data[0].line.uid;
                metadata.line.uid = data[0].line.uid;
                let {upload_type,language,insert_id} = data[0];
                metadata = { ...metadata,upload_type,language,insert_id};
                this.setState({filedata, metadata, open: true});
            });
        } else {
            this.setState({filedata, metadata, open: true});
        }
    };

    onComplete = (metadata) => {
        console.log(":: Put Metadata:", metadata);
        this.setState({open: false});
        putData(`insert`, metadata, (cb) => {
            console.log(":: WFSRV respond: ",cb);
        });
    };

    onCancel = () => {
        this.setState({open: false});
    };

    render() {
        const {filedata,metadata,user,loading,insert,open} = this.state;
        let login = (<LoginPage onInsert={this.setMode} user={user} loading={loading} />);
        let upload = (<UploadFile onFileData={this.setFileData} mode={insert} />);

        return (
            <Fragment>
                {this.state.insert === null ? login : upload}
                <Modal { ...this.props }
                       closeOnDimmerClick={false}
                       closeIcon={true}
                       onClose={this.onCancel}
                       open={open}
                       size="large"
                       mountNode={document.getElementById("ltr-modal-mount")}>
                    <InsertApp
                        filedata={filedata}
                        metadata={metadata}
                        onComplete={this.onComplete} />
                </Modal>
            </Fragment>
        );

    }
}

export default App;