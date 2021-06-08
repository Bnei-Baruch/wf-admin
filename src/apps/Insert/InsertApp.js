import React, {Component, Fragment} from 'react';
import {Button, Container, Message, Modal} from 'semantic-ui-react';
import UploadFile from './UploadFile';
import InsertModal from './InsertModal';
import {insertName, insertSha, putData, WFSRV_BACKEND} from '../../shared/tools';

class InsertApp extends Component {

    state = {
        user: null,
        insert: null,
        filedata: null,
        metadata: {},
        open: false,
        loading: true,
    };

    setInserMode = (mode) => {
        console.log(":: Setting Mode:", mode);
        this.setState({insert: mode});
    };

    checkFileData = (filedata) => {
        const {insert} = this.state;
        insertSha(filedata.sha1, (data) => {
            console.log(":: Got SHA1 check", data);
            if (data.total > 0 && insert === "1") {
                console.log(":: File with SHA1: " + filedata.sha1 + " - already exist!");
                alert("File already exist in MDB!");
            } else if (data.total > 0 && insert === "2") {
                console.log(":: File with SHA1: " + filedata.sha1 + " - already exist - Set rename mode");
                this.setState({insert: "3"});
                this.setMetaData(filedata);
            } else {
                this.setMetaData(filedata);
            }
        });
    };

    setMetaData = (filedata) => {
        console.log(":: Setting metadata from:", filedata);
        const {sha1,size,file_name,type,url} = filedata;
        const {roles} = this.props.user;
        let archive_typist = roles.find(r => r === "archive_typist");
        let line = {content_type: null, upload_filename: file_name, mime_type: type,
            url: window.location.href + `${WFSRV_BACKEND}${url}`};
        let metadata = {sha1, size, line, content_type: "", language: null,
            send_uid: "", upload_type: (archive_typist ? "akladot": ""), insert_type: this.state.insert};

        // Extract and validate UID from file_name
        let uid = file_name.split(".")[0].split("_").pop();
        if(uid.match(/^([a-zA-Z0-9]{8})$/) && (/[_]/).test(file_name))
            metadata.send_uid = uid;

        // Extract and validate date from file_name
        if((/\d{4}-\d{2}-\d{2}/).test(filedata.file_name)) {
            let string_date = filedata.file_name.match(/\d{4}-\d{2}-\d{2}/)[0];
            // let test_date = moment(string_date);
            // let date = test_date.isValid() ? string_date : new Date().toLocaleString('sv').slice(0,10);
            metadata.date = string_date;
        } else {
            metadata.date = new Date().toLocaleString('sv').slice(0,10);
        }

        // If mode rename get insert workflow data
        if(this.state.insert === "3") {
            insertName(sha1, "sha1", (data) => {
                console.log(":: insert data - got: ",data);
                if(data.length > 0) {
                    metadata.send_uid = data[0].line.uid;
                    metadata.line.uid = data[0].line.uid;
                    metadata.line.old_name = data[0].insert_name;
                    let {upload_type, language, insert_id} = data[0];
                    metadata = {...metadata, upload_type, language, insert_id};
                    this.setState({filedata, metadata, open: true});
                } else {
                    console.log("File exist in MDB, but come from import");
                    alert("File exist in MDB, but did NOT found in insert workflow");
                    // TODO: What we going to do in this case?
                    this.setState({insert: null});
                    return false;
                }
            });
        } else if(this.state.insert === "4") {
            metadata.line.film_date = metadata.date;
            // Clean string
            metadata.insert_name = metadata.line.upload_filename.replace(/([^-_a-zA-Z0-9\\.]+)/g, '').toLowerCase();
            metadata.language = metadata.insert_name.slice(0, 3);
            //FIXME: Here will detection content_type from file_name string
            metadata.line.content_type = "BLOG_POST";
            metadata.line.lecturer = "rav";
            metadata.line.source = "upload";
            metadata.line.language = metadata.language;
            metadata.line.original_language = metadata.language;
            [metadata.file_name, metadata.extension] = metadata.insert_name.split('.');
            metadata.upload_type = "dgima";
            metadata.send_id = null;
            delete metadata.send_uid;
            delete metadata.content_type;
            this.onComplete(metadata);
        } else {
            this.setState({filedata, metadata, open: true});
        }
    };

    onComplete = (metadata) => {
        console.log(":: Put Metadata:", metadata);
        this.setState({open: false});
        putData(`${WFSRV_BACKEND}/workflow/insert`, metadata, (cb) => {
            console.log(":: WFSRV respond: ",cb);
            if(cb.status === "ok") {
                alert("Insert successful :)");
                this.setState({open: false, insert: null});
            } else {
                alert("Something gone wrong :(");
                this.setState({open: false});
            }
        });
    };

    onCancel = () => {
        this.setState({open: false, insert: null});
    };

    render() {
        const {filedata,metadata,insert,open} = this.state;
        let upload = (<UploadFile onFileData={this.checkFileData} mode={insert} />);

        return (
            <Fragment>
                <Container textAlign='center' >
                    <Message size='massive'>
                        <Message.Header>
                        </Message.Header>
                        <p>Service for inserting new materials into the bb archive.</p>
                        <Button.Group size='massive' >
                            <Button positive value='1' onClick={(e,{value}) => this.setInserMode(value)}>&nbsp;&nbsp;Insert&nbsp;</Button>
                            <Button.Or />
                            <Button value='2' onClick={(e,{value}) => this.setInserMode(value)} color='orange'>Update</Button>
                        </Button.Group>
                    </Message>
                </Container>
                {this.state.insert === null ? "" : upload}
                <Modal { ...this.props }
                       closeOnDimmerClick={false}
                       closeIcon={true}
                       onClose={this.onCancel}
                       open={open}
                       size="large"
                       mountNode={document.getElementById("ltr-modal-mount")}>
                    <InsertModal
                        filedata={filedata}
                        metadata={metadata}
                        onComplete={this.onComplete}
                        user={this.props.user} />
                </Modal>
            </Fragment>
        );

    }
}

export default InsertApp;
