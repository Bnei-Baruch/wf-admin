import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import moment from 'moment';
import he from 'moment/locale/he';
import ru from 'moment/locale/ru';
import es from 'moment/locale/es';
import fr from 'moment/locale/fr';
import it from 'moment/locale/it';
import de from 'moment/locale/de';
import en from 'moment/locale/en-gb';
import './InsertApp.css';
import { Button, Header, Modal, Dropdown, Container, Segment, Input } from 'semantic-ui-react';
import { fetchPublishers, fetchUnits, fetchPersons, insertName, getName, getLang } from '../../shared/tools';

import {
    content_options,
    language_options,
    upload_options,
    article_options,
    MDB_LANGUAGES,
    CT_LESSON_PART,
    CT_LECTURE,
    CT_CHILDREN_LESSON_PART,
    CT_WOMEN_LESSON_PART,
    CT_VIRTUAL_LESSON,
    CT_FRIENDS_GATHERING,
    CT_MEAL,
    CT_VIDEO_PROGRAM_CHAPTER,
    CT_FULL_LESSON,
    CT_TEXT,
    CT_UNKNOWN,
    CT_EVENT_PART,
    CT_CLIP,
    CT_TRAINING,
    CT_KITEI_MAKOR,
    CONTENT_TYPE_BY_ID
} from '../../shared/consts';

import MdbData from './MdbData';
import NestedModal from './NestedModal';

class InsertApp extends Component {
    static propTypes = {
        filedata: PropTypes.object,
        metadata: PropTypes.object,
        onInsert: PropTypes.func,
        onCancel: PropTypes.func,
    };
    static defaultProps = {
        filedata: {},
        onInsert: noop,
        onCancel: noop,
    };
    constructor(props) {
        super(props);
        this.state = {
            filedata: { ...props.filedata },
            metadata: {
                sha1: props.filedata.sha1,
                size: props.filedata.size,
                line: {
                    upload_filename: props.filedata.filename,
                    mime_type: props.filedata.type,
                    url: props.filedata.url
                }
            },
            unit: {},
            files: [],
            store: { sources: [], tags: [], publishers: []},
            startDate: this.props.filedata.start_date ? moment(this.props.filedata.start_date) : moment(),
            start_date: this.props.filedata.start_date ? this.props.filedata.start_date : moment().format('YYYY-MM-DD'),
            end_date: this.props.filedata.start_date ? this.props.filedata.start_date : moment().format('YYYY-MM-DD'),
            content_type: this.props.filedata.content_type ? this.props.filedata.content_type : null,
            language: this.props.filedata.language ? this.props.filedata.language : null,
            locale: "he",
            upload_type: this.props.filedata.upload_type ? this.props.filedata.upload_type : "",
            input_uid: this.props.filedata.input_uid ? this.props.filedata.input_uid : null,
            isValidated: false,
            cTypeSelection: true,
            uTypeSelection: this.props.filedata.upload_type !== "aricha",
        };
        this.handleDateChange = this.handleDateChange.bind(this);
    }

    componentDidMount() {
        // Set sunday first weekday in russian
        moment.updateLocale('ru', { week: {dow: 0,},});
        moment.updateLocale('es', { week: {dow: 0,},});
        moment.updateLocale('it', { week: {dow: 0,},});
        moment.updateLocale('de', { week: {dow: 0,},});
        moment.updateLocale('fr', { week: {dow: 0,},});
        moment.updateLocale('en', { week: {dow: 0,},});
        //fetchSources(sources => this.setState({ store: { ...this.state.store, sources } }));
        //fetchTags(tags => this.setState({ store: { ...this.state.store, tags } }));
        fetchPublishers(publishers => this.setState({ store: { ...this.state.store, publishers: publishers.data } }));
    };

    componentDidUpdate(prevProps, prevState) {
        //console.log("--componentDidUpdate--", prevState);
        let prev = [prevState.content_type, prevState.language, prevState.upload_type, prevState.start_date];
        let next = [this.state.content_type, this.state.language, this.state.upload_type, this.state.start_date];
        if (JSON.stringify(prev) !== JSON.stringify(next))
            this.setState({ isValidated: false });
    };

    handleContentFilter = (e, data) => {
        console.log("-Content type: "+ data.value);
        if(data.value === "ARTICLE") {
            this.setState({content_type: data.value, input_uid: "", upload_type: "", cTypeSelection: false})
        } else {
            this.setState({content_type: data.value, input_uid: ""})
        }
    };

    handleLanguageFilter = (e, data) => {
        console.log("-Language: "+ data.value);
        this.setState({language: data.value, locale: getLang(data.value)});
    };

    handleUploadFilter = (e, data) => {
        console.log("-Upload type: "+ data.value);
        if(data.value === "aricha") {
            this.setState({upload_type: data.value, uTypeSelection: false});
        } else {
            this.setState({upload_type: data.value});
        }
    };

    handleDateChange(date) {
        let startdate = (date) ? date.format('YYYY-MM-DD') : this.props.filedata.filename.split(".")[0].split("_")[3];
        let enddate = (date) ? date.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
        this.setState({
            startDate: date,
            start_date: startdate, end_date: enddate
        });
    }

    handleOnComplete = () => {
        console.log("--HandelOnComplete--");
        // Object we return from react
        console.log("::We returnt this metadata: ", this.state.metadata);
        this.props.onInsert(this.state.metadata);
    };

    handleOnClose = () => {
        console.log("--HandelOnCancel--");
        this.props.onCancel();
    };

    handleUidInput = (e, data) => {
        console.log(":: Input changed: ", data.value);
        this.setState({input_uid: data.value, isValidated: false});
    };

    handlePubSelect = (data) => {
        console.log("--HandlePubSelect--");
        console.log(":: Publisher selected: ", data);
        this.setState({metadata: { ...this.state.metadata, publisher: data.pattern, publisher_uid: data.uid }});
    };

    handleUidSelect = (data) => {
        console.log("--HandleUidSelect--");
        console.log(":::: Unit Selected :::: ", data);
        let path = data.id + '/files/';
        fetchUnits(path, (data) => {
                console.log(":: Got FILES: ", data);
                let units = data.filter((file) => (file.name.split(".")[0].split("_").pop().match(/^t[\d]{10}o$/)));
                // Filter trimmed without send
                let unit_file = units.filter(capd => capd.properties.capture_date);
                console.log(":: Try to get trim source: ", unit_file);
                if(unit_file.length === 0 && this.state.upload_type !== "aricha" && data.length > 0) {
                    console.log("No trim source found, taking first file:",data[0]);
                    let unit_sendname = data[0].name.split(".")[0];
                    let unit_sendext = data[0].name.split(".")[1];
                    let unit_name = unit_sendname + "_" + data[0].uid + "." + unit_sendext;
                    this.setState({files: data, send_name: unit_name});
                } else if(data.length === 0 && this.state.upload_type !== "aricha") {
                    console.log(":: No files in this UNIT!");
                    this.setState({files: null, send_name: null});
                } else if(unit_file.length === 0 && this.state.upload_type === "aricha") {
                    this.setState({files: data, send_name: this.props.filedata.filename});
                } else {
                    this.setState({files: data, send_name: unit_file[0].name});
                }
                let metadata = this.state.metadata;
                metadata.upload_type = this.state.upload_type;
                metadata.language = this.state.language;
                metadata.insert_type = this.props.insert === "new" ? "1" : "2";
                metadata.send_id = this.state.send_name ? this.state.send_name.split(".")[0].split("_").pop().slice(0,-1) : null;
                metadata.line.uid = this.state.unit.uid;
                metadata.line.send_name = this.state.send_name ? this.state.send_name : null;
                metadata.line.content_type = CONTENT_TYPE_BY_ID[this.state.unit.type_id];
                metadata.line.capture_date = this.state.unit.properties.capture_date;
                metadata.line.film_date = this.state.unit.properties.film_date;
                metadata.line.original_language = MDB_LANGUAGES[this.state.unit.properties.original_language];
                fetchPersons(this.state.unit.id, (data) => {
                    console.log(":: Got Persons: ",data);
                    if(data.length > 0 && data[0].person.uid === "abcdefgh") {
                        metadata.line.lecturer = "rav";
                        this.setState({lecturer: "rav"});
                    } else {
                        metadata.line.lecturer = "norav";
                        this.setState({lecturer: "norav"});
                    }
                    // Calculate new name here
                    metadata.filename = getName(metadata);
                    console.log(":: Metadata: ",metadata);
                    // Check if name already exist
                    insertName(metadata.filename, (data) => {
                        console.log(":: Got WFObject",data);
                        if(data.length > 0 && this.props.insert === "new") {
                            console.log(":: File with name: "+metadata.filename+" - already exist!");
                            alert("File with name: "+metadata.filename+" - already exist!");
                            this.setState({ isValidated: false });
                        } else if(data.length === 0 && this.props.insert === "update") {
                            console.log(":: File with name: "+metadata.filename+" - does NOT exist! In current mode the operation must be update only");
                            alert("File with name: "+metadata.filename+" - does NOT exist! In current mode the operation must be update only");
                            this.setState({ isValidated: false });
                        } else {
                            this.state.content_type && this.state.language && this.state.upload_type ? this.setState({ isValidated: true }) : this.setState({ isValidated: false });
                            this.setState({metadata: { ...this.state.metadata }});
                        }
                    });
                });
            });
        this.setState({ unit: data });
    };

    render() {
        //const { store } = this.state;

        let start_date = (
            <DatePicker
                className="datepickercs"
                locale={this.state.locale}
                dateFormat="YYYY-MM-DD"
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                maxDate={moment()}
                openToDate={moment(this.state.start_date)}
                selected={this.state.startDate}
                onChange={this.handleDateChange}
                //excludeDates={[moment(), moment().add(1, "months")]}
                //highlightDates={moment().add(-1, "months")}
            />
        );

        let input_uid = (
            <Input
                error={false}
                className="input_uid"
                size="mini"
                icon='barcode'
                placeholder="UID"
                iconPosition='left'
                value={this.state.input_uid}
                onChange={this.handleUidInput}
            />
        );

        let update_style = (<style>{'.ui.segment { background-color: #f9e7db; }'}</style>);

        return (
            <Container className='insert_app' >
                <Segment clearing>
                    {this.props.insert === "update" ? update_style : ""}
                    <Header floated='left' >
                        <Dropdown
                            error={!this.state.content_type}
                            disabled={!this.state.cTypeSelection}
                            defaultValue={this.state.content_type}
                            className="large"
                            placeholder="Content:"
                            selection
                            options={content_options}
                            content_type={this.state.content_type}
                            onChange={this.handleContentFilter}
                            value={this.state.value} >
                        </Dropdown>
                        <Dropdown
                            error={!this.state.language}
                            defaultValue={this.state.language}
                            className="large"
                            placeholder="Language:"
                            selection
                            options={language_options}
                            language={this.state.language}
                            onChange={this.handleLanguageFilter}
                            value={this.state.value} >
                        </Dropdown>
                    </Header>
                    <Header floated='right'>
                        {!this.state.upload_type.match(/^(aricha|article|publication)$/) ? input_uid : ""}
                    </Header>
                        {this.state.upload_type.match(/^(aricha|article|publication)$/) ? start_date : start_date}
                </Segment>
                <Segment clearing secondary color='blue'>
                <Modal.Content className="tabContent">
                    <MdbData {...this.state} onUidSelect={this.handleUidSelect} />
                </Modal.Content>
                </Segment>
                <Segment clearing tertiary color='yellow'>
                <Modal.Actions>
                    <Input
                        disabled
                        className="filename"
                        icon='file'
                        iconPosition='left'
                        focus={true}
                        value={ this.state.filedata.filename }
                    />
                    <Dropdown
                        upward
                        error={!this.state.upload_type}
                        disabled={!this.state.uTypeSelection}
                        defaultValue={this.state.upload_type}
                        placeholder="Upload Type:"
                        selection
                        options={this.state.content_type === "ARTICLE" ? article_options : upload_options}
                        upload_type={this.state.upload_type}
                        onChange={this.handleUploadFilter}
                        value={this.state.value} >
                    </Dropdown>
                    <NestedModal
                        upload_type={this.state.upload_type}
                        store={this.state.store}
                        onUidSelect={this.handleUidSelect}
                        onPubSelect={this.handlePubSelect}
                    />
                    <Button
                        color='green'
                        disabled={!this.state.isValidated}
                        onClick={this.handleOnComplete} >Select
                    </Button>
                </Modal.Actions>
                </Segment>
            </Container>
        );
    }
}

export default InsertApp;
