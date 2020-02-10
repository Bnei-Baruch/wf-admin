import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'moment/locale/he';
import 'moment/locale/ru';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/it';
import 'moment/locale/de';
import 'moment/locale/en-gb';
import './InsertApp.css';
import { Grid, Button, Header, Modal, Dropdown, Container, Segment, Input } from 'semantic-ui-react';
import {
    fetchPublishers,
    fetchPersons,
    insertName,
    getName,
    getLang,
    getDataByID,
    fetchUnits,
    getDCT,
    insertData, insertLine
} from '../../shared/tools';
import {content_options, language_options, upload_extensions, MDB_LANGUAGES, CONTENT_TYPE_BY_ID} from '../../shared/consts';

import MdbData from './MdbData';
import NestedModal from './NestedModal';

class InsertModal extends Component {

    state = {
        metadata: {...this.props.metadata},
        unit: null,
        files: [],
        store: { sources: [], tags: [], publishers: []},
        loading: false,
        locale: "he",
        isValidated: false,
    };


    componentDidMount() {
        const {send_uid} = this.state.metadata;
        this.inputUid(send_uid);
        // Set sunday first weekday in russian
        moment.updateLocale('ru', { week: {dow: 0,},});
        moment.updateLocale('es', { week: {dow: 0,},});
        moment.updateLocale('it', { week: {dow: 0,},});
        moment.updateLocale('de', { week: {dow: 0,},});
        moment.updateLocale('fr', { week: {dow: 0,},});
        moment.updateLocale('en', { week: {dow: 0,},});
        fetchPublishers(publishers => this.setState({ store: { ...this.state.store, publishers: publishers.data } }));
    };

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevState.metadata) !== JSON.stringify(this.state.metadata))
            this.setState({ isValidated: false });
    };

    selectContentType = (content_type) => {
        let {metadata} = this.state;
        let upload_type = content_type === "BLOG_POST" ? 'declamation' : this.props.metadata.upload_type;
        this.setState({metadata: {...metadata, content_type, upload_type}});
    };

    selectLanguage = (language) => {
        let {metadata} = this.state;
        this.setState({metadata: {...metadata, language}, locale: getLang(language)});
    };

    selectUpload = (upload_type) => {
        let {metadata} = this.state;
        this.setState({metadata: {...metadata,upload_type}});
    };

    selectDate = (date) => {
        let {metadata} = this.state;
        this.setState({metadata: {...metadata, date: date.format('YYYY-MM-DD')}});
    };

    onClose = () => {
        this.props.onCancel();
    };

    inputUid = (send_uid) => {
        let {metadata} = this.state;
        this.setState({metadata: {...metadata, send_uid}, isValidated: false});
        if(send_uid.length === 8) {
            fetchUnits(`?query=${send_uid}`, (data) => {
                let unit = data.data[0];
                console.log(":: Got UNIT: ", data);
                metadata.content_type = getDCT(CONTENT_TYPE_BY_ID[unit.type_id]);
                const {capture_date} = unit.properties;
                metadata.date = capture_date && capture_date !== "0001-01-01" ? capture_date : metadata.date;
                this.setState({metadata: {...metadata, send_uid}, isValidated: false, unit});
            })
        }
    };

    setPublisher = (publisher) => {
        const {uid,pattern} = publisher;
        let {metadata} = this.state;
        metadata.line.publisher_uid = uid;
        metadata.line.publisher = pattern;
        console.log(":: Set Publisher: ", publisher);
        this.setState({metadata: {...metadata}});
    };

    onGetUID = (unit) => {
        console.log(":: Selected unit: ", unit);
        this.setState({unit});
        let {metadata} = this.state;

        // Check if all Required meta is selected
        const {content_type, language, upload_type} = metadata;
        if (!content_type || !language || !upload_type) {
            console.log(":: Required meta not selected! ::");
            this.setState({ isValidated: false });
            return
        }

        // Take info from unit properties
        metadata = insertLine(metadata,unit);

        // Declamation - that does not has unit
        if(upload_type === "declamation") {
            this.checkMeta(metadata);
            return
        }

        let {uid, id} = unit;

        // Dgima - Check if name already exist in MDB
        if(upload_type === "dgima") {
            fetchUnits(`${metadata.line.unit_id}/files/`, (data) => {
                console.log(":: Fetch file for dgima: ",data);
                let published = data.filter(p => p.published && p.removed_at === null);
                console.log(" :: Published: ", published);
                let mdb_name = published.filter(s => s.name.match(metadata.insert_name));
                if(mdb_name.length > 0) {
                    alert("File with name: "+metadata.insert_name+" - exist in MDB");
                    this.setState({ isValidated: false });
                } else {
                    const wfid = metadata.send_id;
                    wfid ? this.newUnitWF(metadata, wfid) : this.oldUnitWF(metadata, id);
                }
            });
            return
        }

        // Dibuv - check and got needed data for remux
        if(upload_type === "dibuv") {
            fetchUnits(`${id}/files/`, (data) => {
                console.log(" :: Fetch files: ", data);
                let published = data.filter(p => p.published && p.removed_at === null);
                console.log(" :: Published: ", published);
                let lchk = published.find(l => l.name.match(language+"_"));
                console.log(" :: Check: ", lchk);
                // Check if uploaded language already exist
                if(lchk && metadata.insert_type === "1") {
                    alert("Selected language already exist");
                    this.setState({ isValidated: false });
                } else if(lchk && metadata.insert_type === "2") {
                    insertData(uid, "uid", (data) => {
                        console.log(":: insert data - got: ",data);
                        if(data.length > 0) {
                            //ARCHIVE_BUG: Not in all files we got original_language property so we going to check string
                            //let remux_src = published.filter(s => s.language === properties.original_language && s.mime_type === "video/mp4");
                            //ARCHIVE_BUG: We got case where two langueags wa with _o_ name, so there is no normal way to know original language
                            //let remux_src = published.filter(s => s.name.match("_o_") && s.mime_type === "video/mp4");
                            let remux_src = published.filter(s => s.name.match("heb_o_") && s.mime_type === "video/mp4");
                            console.log(" :: Got sources for remux: ", remux_src);
                            // We must get here 1 or 2 files and save their url
                            if(remux_src.length === 0 || remux_src.length > 2) {
                                alert("Fail to get valid sources for remux");
                                this.setState({ isValidated: false });
                                // It's mean we did not get HD here
                            } else if(remux_src.length === 1) {
                                metadata.insert_id = data[0].insert_id;
                                metadata.line.nHD = remux_src[0].properties.url;
                                metadata.line.nHD_sha1 = remux_src[0].sha1;
                                metadata.line.HD = null;
                                metadata.line.HD_sha1 = null;
                                metadata.insert_type = "5";
                                metadata.insert_name = language + "_t_" +remux_src[0].name.split("_").slice(2).join("_").split(".")[0]+".wav";
                                const wfid = metadata.send_id;
                                wfid ? this.newUnitWF(metadata, wfid) : this.oldUnitWF(metadata, id);
                                // It's mean we get HD and nHD here
                            } else {
                                for(let i=0;i<remux_src.length;i++) {
                                    metadata.line[remux_src[i].properties.video_size] = remux_src[i].properties.url;
                                    metadata.line[remux_src[i].properties.video_size + "_sha1"] = remux_src[i].sha1;
                                    if(remux_src[i].properties.video_size === "nHD")
                                        metadata.insert_name = language + "_t_" +remux_src[i].name.split("_").slice(2).join("_").split(".")[0]+".wav";
                                }
                                metadata.insert_type = "5";
                                metadata.insert_id = data[0].insert_id;
                                const wfid = metadata.send_id;
                                wfid ? this.newUnitWF(metadata, wfid) : this.oldUnitWF(metadata, id);
                            }
                        } else {
                            console.log("Not found insert we going to fix");
                            alert("Not found insert we going to fix");
                            this.setState({ isValidated: false });
                        }
                    });
                } else if(lchk && metadata.insert_type === "3") {
                    //TODO: Rename mode
                    alert("Not ready yet");
                    this.setState({ isValidated: false });
                } else {
                    // Not in all files we got original_language property so we going to check string
                    // let remux_src = published.filter(s => s.language === properties.original_language && s.mime_type === "video/mp4");
                    //ARCHIVE_BUG: We got case where two langueags wa with _o_ name, so there is no normal way to know original language
                    //let remux_src = published.filter(s => s.name.match("_o_") && s.mime_type === "video/mp4");
                    let remux_src = published.filter(s => s.name.match("heb_o_") && s.mime_type === "video/mp4");
                    console.log(" :: Got sources for remux: ", remux_src);
                    // We must get here 1 or 2 files and save their url
                    if(remux_src.length === 0 || remux_src.length > 2) {
                        alert("Fail to get valid sources for remux");
                        this.setState({ isValidated: false });
                        // It's mean we did not get HD here
                    } else if(remux_src.length === 1) {
                        metadata.line.nHD = remux_src[0].properties.url;
                        metadata.line.nHD_sha1 = remux_src[0].sha1;
                        metadata.line.HD = null;
                        metadata.line.HD_sha1 = null;
                        metadata.insert_type = "4";
                        metadata.insert_name = language + "_t_" +remux_src[0].name.split("_").slice(2).join("_").split(".")[0]+".wav";
                        const wfid = metadata.send_id;
                        wfid ? this.newUnitWF(metadata, wfid) : this.oldUnitWF(metadata, id);
                        // It's mean we get HD and nHD here
                    } else {
                        for(let i=0;i<remux_src.length;i++) {
                            metadata.line[remux_src[i].properties.video_size] = remux_src[i].properties.url;
                            metadata.line[remux_src[i].properties.video_size + "_sha1"] = remux_src[i].sha1;
                            if(remux_src[i].properties.video_size === "nHD")
                                metadata.insert_name = language + "_t_" +remux_src[i].name.split("_").slice(2).join("_").split(".")[0]+".wav";
                        }
                        metadata.insert_type = "4";
                        const wfid = metadata.send_id;
                        wfid ? this.newUnitWF(metadata, wfid) : this.oldUnitWF(metadata, id);
                    }
                }
            });
            return
        }

        // Check if unit was imported from old KM
        const wfid = metadata.send_id;
        wfid ? this.newUnitWF(metadata, wfid) : this.oldUnitWF(metadata, id);
    };

    newUnitWF = (metadata, wfid) => {
        console.log(":::: New Workflow UNIT :::: ");
        console.log(":: Workflow ID: ", wfid);
        getDataByID(wfid, (wfdata) => {
            if(wfdata) {
                console.log(":: Got Workflow Data: ", wfdata);
                metadata.line.send_name = wfdata.file_name;
                metadata.line.lecturer = wfdata.line.lecturer;
                if(metadata.upload_type !== "aricha" && metadata.upload_type !== "dibuv")
                    metadata.insert_name = getName(metadata);
                console.log(":: Metadata insert_name: \n%c" + metadata.insert_name, "color:Green");
                this.checkMeta(metadata);
            } else {
                alert("Something wrong happend :(");
                this.setState({ isValidated: false });
            }
        });
    };

    oldUnitWF = (metadata, id) => {
        console.log(":::: Old Workflow UNIT :::: ");
        metadata.line.send_name = metadata.line.upload_filename.split('.')[0];
        fetchPersons(id, (data) => {
            console.log(":: Got Persons: ",data);
            metadata.line.lecturer = (data.length > 0 && data[0].person.uid === "abcdefgh") ? "rav" : "norav";
            if(metadata.upload_type !== "aricha" && metadata.upload_type !== "dibuv")
                metadata.insert_name = getName(metadata);
            console.log(":: Metadata insert_name: \n%c"+metadata.insert_name,"color:Green");
            this.checkMeta(metadata);
        });
    };

    checkMeta = (metadata) => {
        console.log(":: checkMeta - metadata: ", metadata);
        const {insert_type, insert_name, upload_type} = metadata;

        // Check valid file_name string
        if(metadata.insert_name === null) {
            alert("Upload file name is worng");
            this.setState({ isValidated: false });
            return
        }

        [metadata.file_name, metadata.extension] = metadata.insert_name.split('.');

        // Check valid string
        if(insert_name.length < 30) {
            alert("Something wrong in file name building");
            this.setState({ isValidated: false });
            return
        }

        // Check upload type extension
        let ext = upload_extensions[upload_type].filter(ext => ext === metadata.extension);
        if (ext.length === 0) {
            alert("Extension: " + metadata.extension + " - is NOT valid for upload type - " + upload_type);
            this.setState({ isValidated: false });
            return
        }

        // Check if name already exist in WFDB
        insertName(insert_name, "insert_name", (data) => {
            console.log(":: insertName - got: ",data);
            if(data.length > 0 && insert_type === "1") {
                console.log(":: File with name: "+insert_name+" - already exist!");
                alert("File with name: "+insert_name+" - already exist!");
                this.setState({ isValidated: false });
            } else if(data.length === 0 && insert_type === "2") {
                console.log(":: File with name: "+insert_name+" - does NOT exist! In current mode the operation must be update only");
                alert("File with name: "+insert_name+" - does NOT exist! In current mode the operation must be update only");
                this.setState({ isValidated: false });
            } else if(data.length === 0 && insert_type === "5") {
                // This validation to check that we update inserted dibuv and NOT translation from ingest
                console.log(":: File with name: "+insert_name+" - does NOT exist! In current mode the operation must be update only");
                alert("File with name: "+insert_name+" - does NOT exist! In current mode the operation must be update only");
                this.setState({ isValidated: false });
            } else {
                this.setState({metadata, isValidated: true});
            }
        });
    };

    onComplete = () => {
        this.setState({ isValidated: false, loading: true });
        let {metadata} = this.state;
        const {name,email} = this.props.user;
        metadata.line.name = name;
        metadata.line.email = email;
        delete metadata.send_uid;
        delete metadata.content_type;
        console.log(" ::: onComplete metadata ::: ", metadata);
        this.props.onComplete(metadata);
    };

    render() {

        const {file_name} = this.props.filedata;
        const {roles} = this.props.user;
        const {metadata, isValidated, loading, locale, unit} = this.state;
        const {date,upload_type,content_type,language,insert_type,send_uid} = metadata;

        //let archive_uploader = roles.find(r => r === "archive_uploader");
        let archive_typist = roles.find(r => r === "archive_typist");

        let date_picker = (
            <DatePicker
                className="datepickercs"
                locale={locale}
                dateFormat="YYYY-MM-DD"
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                maxDate={moment()}
                openToDate={moment(date)}
                selected={moment(date)}
                onChange={this.selectDate}
            />
        );

        let uid_input = (
            <Input
                error={false}
                className="input_uid"
                size="mini"
                icon='barcode'
                placeholder="UID"
                iconPosition='left'
                value={send_uid}
                onChange={(e,{value}) => this.inputUid(value)}
            />
        );

        let update_style = (<style>{'.ui.segment { background-color: #f9e7db; }'}</style>);
        let rename_style = (<style>{'.ui.segment { background-color: #e2c2ae; }'}</style>);

        const upload_options = [
            { value: 'akladot', text: ' ‏הקלדות', icon: 'file word outline', disabled: (!archive_typist || content_type === "ARTICLES") },
            { value: 'tamlil', text: 'תמליל', icon: 'indent', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'kitei-makor', text: 'קיטעי-מקור', icon: 'copyright', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'sirtutim', text: ' ‏שרטוטים', icon: 'edit', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'dibuv', text: 'דיבוב', icon: 'translate', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'research-material', text: 'נספחים', icon: 'paperclip', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'aricha', text: ' עריכה', icon: 'paint brush', disabled: true},
            { value: 'declamation', text: ' דיקלום', icon: 'unmute', disabled: true},
            { value: 'article', text: 'מאמרים ', icon: 'newspaper', disabled: (archive_typist || content_type !== "ARTICLES") },
            { value: 'publication', text: 'פירסומים ', icon: 'announcement', disabled: (archive_typist || content_type !== "ARTICLES") },
        ];

        return (
            <Container className="insert_app">
                <Segment clearing>
                    {insert_type === "2" ? update_style : ""}
                    {insert_type === "3" ? rename_style : ""}
                    <Header floated='left' >
                        <Dropdown
                            error={!content_type}
                            disabled={content_type === "ARTICLE"}
                            className="large"
                            placeholder="Content:"
                            selection
                            options={content_options}
                            content_type={content_type}
                            onChange={(e,{value}) => this.selectContentType(value)}
                            value={content_type} >
                        </Dropdown>
                        <Dropdown
                            error={!language}
                            className="large"
                            placeholder="Language:"
                            selection
                            options={language_options}
                            language={language}
                            onChange={(e,{value}) => this.selectLanguage(value)}
                            value={language} >
                        </Dropdown>
                        <Dropdown
                            className="large"
                            error={!upload_type}
                            disabled={this.props.metadata.upload_type !== "" || content_type === "" || content_type === "BLOG_POST"}
                            placeholder="Upload Type:"
                            selection
                            options={upload_options}
                            upload_type={upload_type}
                            onChange={(e,{value}) => this.selectUpload(value)}
                            value={upload_type}
                        />
                    </Header>
                    <Header floated='right'>
                        {uid_input}
                    </Header>
                    {date_picker}
                </Segment>
                <Segment clearing secondary color='blue'>
                    <Modal.Content className="tabContent">
                        <MdbData metadata={metadata} units={[unit]} onUidSelect={this.onGetUID} />
                    </Modal.Content>
                </Segment>
                <Segment clearing tertiary color='yellow'>
                    <Modal.Actions>
                        <Grid columns='equal'>
                            <Grid.Column width={12}>
                                <Input
                                    disabled
                                    fluid
                                    icon='file'
                                    iconPosition='left'
                                    focus={true}
                                    value={file_name}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Button
                                    fluid
                                    color='green'
                                    disabled={!isValidated}
                                    loading={loading}
                                    onClick={this.onComplete} >Send
                                </Button>
                            </Grid.Column>
                        </Grid>
                        <NestedModal
                            upload_type={upload_type}
                            publishers={this.state.store.publishers}
                            onUidSelect={this.onGetUID}
                            onPubSelect={this.setPublisher}
                        />
                    </Modal.Actions>
                </Segment>
            </Container>
        );
    }
}

export default InsertModal;
