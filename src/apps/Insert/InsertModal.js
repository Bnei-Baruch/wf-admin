import React, { Component } from 'react';
import DatePicker from 'react-datepicker';

import he from 'date-fns/locale/he';
//import ru from'date-fns/locale/ru';
// import 'date-fns/locale/es';
// import 'date-fns/locale/fr';
// import 'date-fns/locale/it';
// import 'date-fns/locale/de';
// import 'date-fns/locale/en-gb';
import './InsertApp.css';
import {Grid, Button, Header, Modal, Dropdown, Container, Segment, Input, Icon} from 'semantic-ui-react';
import {
    fetchPublishers,
    fetchPersons,
    insertName,
    getName,
    getLang,
    getDataByID,
    fetchUnits,
    getDCT,
    insertLine,
    remuxLine,
} from '../../shared/tools';
import {language_options, upload_extensions, CONTENT_TYPE_BY_ID, getContentOptions, getUploadOptions} from '../../shared/consts';
import { fetchSources } from '../CIT/shared/store';

import MdbData from './MdbData';
import NestedModal from './NestedModal';
import SourceSelector from "../CIT/components/SourceSelector";

class InsertModal extends Component {

    state = {
        metadata: {...this.props.metadata},
        unit: null,
        files: [],
        store: { sources: [], tags: [], publishers: []},
        loading: false,
        locale: he,
        isValidated: false,
        source: "",
    };


    componentDidMount() {
        const {send_uid} = this.state.metadata;
        this.inputUid(send_uid);
        // Set sunday first weekday in russian
        // moment.updateLocale('ru', { week: {dow: 0,},});
        // moment.updateLocale('es', { week: {dow: 0,},});
        // moment.updateLocale('it', { week: {dow: 0,},});
        // moment.updateLocale('de', { week: {dow: 0,},});
        // moment.updateLocale('fr', { week: {dow: 0,},});
        // moment.updateLocale('en', { week: {dow: 0,},});
        fetchPublishers(publishers => this.setState({ store: { ...this.state.store, publishers: publishers.data } }));
        fetchSources(sources => this.setState({ store: { ...this.state.store, sources } }));
    };

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevState.metadata) !== JSON.stringify(this.state.metadata))
            this.setState({ isValidated: false });
    };

    selectContentType = (content_type) => {
        let {metadata} = this.state;
        let upload_type = content_type === "BLOG_POST" ? 'declamation' : this.props.metadata.upload_type;
        if(content_type === "SOURCE")
            upload_type = "source";
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
        this.setState({metadata: {...metadata, date: date.toLocaleDateString('sv')}});
    };

    onClose = () => {
        this.props.onCancel();
    };

    inputUid = (send_uid) => {
        let {metadata} = this.state;
        this.setState({metadata: {...metadata, send_uid}, isValidated: false});
    };

    setPublisher = (publisher) => {
        const {uid,pattern} = publisher;
        let {metadata} = this.state;
        metadata.line.publisher_uid = uid;
        metadata.line.publisher = pattern;
        console.log(":: Set Publisher: ", publisher);
        this.setState({metadata: {...metadata}});
    };

    autoSetData = (unit) => {
        let {metadata} = this.state;
        metadata.content_type = getDCT(CONTENT_TYPE_BY_ID[unit.type_id]);
        const {capture_date} = unit.properties;
        metadata.date = capture_date && capture_date !== "0001-01-01" ? capture_date : metadata.date;
        this.setState({metadata});
        console.log("Auto Set Data:", metadata)
    };

    setUnitID = (unit) => {
        console.log(":: Selected unit: ", unit);
        this.setState({unit});
        let {metadata} = this.state;

        // Check if all Required meta is selected
        const {content_type, language, upload_type} = metadata;
        if (!content_type || !language || !upload_type) {
            this.setState({ isValidated: false });
            return
        }

        // Take info from unit properties
        metadata = insertLine(metadata,unit);

        // Declamation - that does not has unit
        if(upload_type === "source") {
            this.checkMeta(metadata);
            return
        }

        // Declamation - that does not has unit
        if(upload_type === "declamation") {
            this.checkMeta(metadata);
            return
        }

        // Dgima - Check if name already exist in MDB
        if(upload_type === "dgima") {
            fetchUnits(`${metadata.line.unit_id}/files/`, (data) => {
                let published = data.filter(p => p.published && p.removed_at === null);
                let mdb_name = published.filter(s => s.name.match(metadata.insert_name));
                //FIXME: Hack for vladek clips
                if(mdb_name.length > 0 && metadata.line.collection_uid !== "KmHXzSQ6") {
                    alert("File with name: "+metadata.insert_name+" - exist in MDB");
                    this.setState({ isValidated: false });
                } else {
                    this.setPerson(metadata, unit);
                }
            });
            return
        }

        // Dibuv - check and got needed data for remux
        if(upload_type === "dibuv") {
            remuxLine(unit, metadata, data => {
                if(data === null) {
                    this.setState({ isValidated: false });
                } else {
                    metadata = data;
                    this.setPerson(metadata, unit);
                }
            });
            return;
        }

        this.setPerson(metadata, unit);
    };

    setPerson = (metadata,unit) => {
        if(metadata.send_id) {
            const wfid = metadata.send_id;
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
                    alert("Unit does NOT exist in workflow");
                    this.setState({ isValidated: false });
                }
            });
        } else {
            const id = unit.id;
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
        }
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
        if(insert_name.length < 30 && upload_type !== "source") {
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
                alert("File with name: "+insert_name+" - already exist!");
                this.setState({ isValidated: false });
            } else if(data.length === 0 && insert_type === "2") {
                alert("File with name: "+insert_name+" - does NOT exist! In current mode the operation must be update only");
                this.setState({ isValidated: false });
            } else if(data.length === 0 && insert_type === "5") {
                // This validation to check that we update inserted dibuv and NOT translation from ingest
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

    selectSource = (data) => {
        console.log(data)
        const source = data.filter(s => (s.children || []).length === 0)[0]
        if(source?.name) {
            this.setState({source});
            this.setUnitID(source);
        }
    };

    render() {

        const {file_name} = this.props.filedata;
        const {roles} = this.props.user;
        const {metadata, isValidated, loading, locale, store, source} = this.state;
        const {date,upload_type,content_type,language,insert_type,send_uid} = metadata;

        const upload_options = getUploadOptions(roles, content_type);
        const content_options = getContentOptions(roles);

        return (
            <Container className="insert_app">
                <Segment className={insert_type !== "1" ? "update_mode" : "insert_mode"} clearing >
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
                            disabled={this.props.metadata.upload_type !== "" || content_type === "" || content_type === "BLOG_POST" || content_type === "SOURCE"}
                            placeholder="Upload Type:"
                            selection
                            options={upload_options}
                            upload_type={upload_type}
                            onChange={(e,{value}) => this.selectUpload(value)}
                            value={upload_type}
                        />
                    </Header>
                    <Header floated='right'>
                        <Input
                            error={send_uid?.length > 0 && send_uid?.length !== 8}
                            className="input_uid"
                            size="mini"
                            icon='barcode'
                            placeholder="UID"
                            iconPosition='left'
                            value={send_uid}
                            onChange={(e,{value}) => this.inputUid(value)}
                        />
                    </Header>
                    <DatePicker
                        className="datepickercs"
                        //locale={locale}
                        dateFormat="yyyy-MM-dd"
                        showYearDropdown
                        showMonthDropdown
                        scrollableYearDropdown
                        maxDate={new Date()}
                        openToDate={new Date(date)}
                        selected={new Date(date)}
                        onChange={this.selectDate}
                    />
                </Segment>
                <Segment clearing secondary color='blue'>
                    {content_type === "SOURCE" ?
                        <div>
                            <SourceSelector tree={store.sources} onSelect={this.selectSource} />
                            <Header as='h2' textAlign='center'>
                                <Icon name='sitemap' />
                                <Header.Content>
                                    {source.name}
                                    <Header.Subheader>{source ? "" : "Use search or selection menu"}</Header.Subheader>
                                </Header.Content>
                            </Header>
                        </div>
                        :
                        <Modal.Content className="tabContent">
                            <MdbData metadata={metadata} autoSetData={this.autoSetData} onUidSelect={this.setUnitID} />
                        </Modal.Content>
                    }
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
                                    color={insert_type === "1" ? "green" : "orange"}
                                    disabled={!isValidated}
                                    loading={loading}
                                    onClick={this.onComplete} >Send
                                </Button>
                            </Grid.Column>
                        </Grid>
                        <NestedModal
                            upload_type={upload_type}
                            publishers={this.state.store.publishers}
                            onUidSelect={this.setUnitID}
                            onPubSelect={this.setPublisher}
                        />
                    </Modal.Actions>
                </Segment>
            </Container>
        );
    }
}

export default InsertModal;
