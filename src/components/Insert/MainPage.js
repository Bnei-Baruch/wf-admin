import React, {Component, Fragment} from 'react';
import { Modal } from 'semantic-ui-react';
import moment from 'moment';
import UploadFile from './UploadFile';
import LoginPage from './LoginPage';
import ModalApp from './InsertApp';
import {insertSha} from '../../shared/tools';
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
        insertSha(filedata.sha1, (data) => {
            console.log(":: Got SHA1 check", data);
            if (data.total > 0) {
                console.log(":: File with SHA1: " + filedata.sha1 + " - already exist!");
                alert("File already exist in MDB!");
            } else {
                console.log(":: Setting Filedata:", filedata);
                // Extract and validate UID from filename
                let uid = filedata.filename.split(".")[0].split("_").pop();
                if(uid.length === 8 && (/[_]/).test(filedata.filename))
                    filedata["input_uid"] = uid;
                // Extract and validate date from filename
                if((/\d{4}-\d{2}-\d{2}/).test(filedata.filename)) {
                    let string_date = filedata.filename.match(/\d{4}-\d{2}-\d{2}/)[0];
                    let test_date = moment(string_date);
                    if(test_date.isValid())
                        filedata["start_date"] = string_date;
                }
                this.setState({filedata: filedata, open: true});
            }
        });
    };

    onComplete = (metadata) => {
        console.log(":: Complete Metadata:", metadata);
        this.setState({open: false});
        fetch('https://upload.kli.one/archive/'+metadata.sha1, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body:  JSON.stringify(metadata)
        })
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                console.log(" :: Post to workflow: ",data)
            }).catch(ex => console.log("Post to workflow:", ex));
    };

    onCancel = (data) => {
        this.setState({open: false});
    };

    render() {
        let login = (<LoginPage onInsert={this.setMode} user={this.state.user} loading={this.state.loading} />);
        let upload = (<UploadFile onFileData={this.setFileData} mode={this.state.insert} />);

        return (
            <Fragment>
                {this.state.insert === null ? login : upload}
                <Modal { ...this.props }
                       closeOnDimmerClick={false}
                       closeIcon={true}
                       onClose={this.onCancel}
                       open={this.state.open}
                       size="large"
                       mountNode={document.getElementById("ltr-modal-mount")}
                >
                    <ModalApp { ...this.state } onComplete={this.onComplete} />
                </Modal>
            </Fragment>
        );

    }
}

export default App;