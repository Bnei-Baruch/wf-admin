import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import he from 'date-fns/locale/he';
//import ru from'date-fns/locale/ru';
// import 'date-fns/locale/es';
// import 'date-fns/locale/fr';
// import 'date-fns/locale/it';
// import 'date-fns/locale/de';
// import 'date-fns/locale/en-gb';
import '../apps/Insert/InsertApp.css';
import {Button, Header, Modal, Dropdown, Segment, Input, Table} from 'semantic-ui-react';
import {fetchPublishers, getLang, fetchUnits, toHms,} from '../shared/tools';
import {language_options, DCT_OPTS} from '../shared/consts';

class MDB extends Component {

    state = {
        metadata: {...this.props.metadata, date: new Date().toLocaleDateString('sv')},
        unit: null,
        files: [],
        store: { sources: [], tags: [], publishers: []},
        loading: false,
        locale: he,
        isValidated: false,
        source: "",
        units: [],
        active: null,
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
    };

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevState.metadata) !== JSON.stringify(this.state.metadata)) {
            this.setState({ isValidated: false });
            this.fetchMdb()
        }
    };

    selectContentType = (content_type) => {
        let {metadata} = this.state;
        this.setState({metadata: {...metadata, content_type}});
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

    fetchMdb = () => {
        const {content_type, date, send_uid} = this.state.metadata;
        let path = send_uid ? [`query=${send_uid}`] : ['page_size=1000', `start_date=${date}`, `end_date=${date}`];
        if(content_type) (DCT_OPTS[content_type] || []).map(ct => path.push(`content_type=${ct}`));
        fetchUnits('?' + path.join('&'), (data) => {
            this.setState({units: data.data, active: null});
            if(send_uid?.length === 8) {
                let unit = data.data[0];
                this.props.autoSetData(unit);
            }
        });
    };

    rawClick = (unit) => {
        this.setUnitID(unit);
        this.setState({active: unit.uid});
    };

    setUnitID = (unit) => {
        console.log(":: Selected unit: ", unit);
        this.setState({unit});
    };

    onComplete = () => {
        let {unit} = this.state;
        this.props.onComplete(unit);
    };

    render() {
        const {metadata, units, loading, unit, active} = this.state;
        const {date,content_type,language,send_uid} = metadata;

        const content_options = [
            { value: 'LESSONS', text: ' ‏שיעור', icon: 'student' },
            { value: 'WEBINARS', text: ' ‏וובינר', icon: 'conversation' },
            { value: 'PROGRAMS', text: ' ‏תוכנית', icon: 'record' },
            { value: 'CLIPS', text: ' ‏קליפ', icon: 'film' },
            { value: 'OTHER', text: ' ‏אחר', icon: 'unordered list' },
        ];
        const lang = getLang(language);

        let uidList = units.map((unit) => {
            if(!unit.properties) return false;
            const {number,part,capture_date,film_date,duration} = unit.properties;
            let name = lang && unit.i18n[lang] ? unit.i18n[lang].name : unit.i18n.he ? unit.i18n.he.name : "Name not found";
            let a = active === unit.uid ? 'active' : '';
            let n = number || "-";
            let p = part === -1 ? "full" : part !== undefined ? part : "";
            let np = n !== "-" && content_type === "LESSONS" ? '( n: ' + n + ' p: ' + p + ' )' : "";
            let date = capture_date || film_date?.split('T')[0];
            let d = duration ? toHms(duration) : "";
            let rtlclass = lang === "he" || !lang ? "rtl-dir" : "";
            return (
                <Table.Row className={a} key={unit.id} onClick={() => this.rawClick(unit)}>
                    <Table.Cell>
                    </Table.Cell>
                    <Table.Cell>{d}</Table.Cell>
                    <Table.Cell textAlign='left' >{np}</Table.Cell>
                    <Table.Cell textAlign='right' className={rtlclass}>{name}</Table.Cell>
                    <Table.Cell>{date}</Table.Cell>
                </Table.Row>
            );
        });


        return (
            <div className="insert_app">
                <Segment basic >
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
                <Segment clearing >
                    <Modal.Content className="tabContent">
                        <Table selectable key='teal' >
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell width={1}>Info</Table.HeaderCell>
                                    <Table.HeaderCell width={1}>Duration</Table.HeaderCell>
                                    <Table.HeaderCell width={2}>No</Table.HeaderCell>
                                    <Table.HeaderCell textAlign='right'>Content Name</Table.HeaderCell>
                                    <Table.HeaderCell width={2}>Date</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {uidList}
                            </Table.Body>
                        </Table>
                    </Modal.Content>
                </Segment>
                <Modal.Actions>
                    <Segment basic>
                        <Button
                            fluid
                            color="green"
                            disabled={!unit}
                            loading={loading}
                            onClick={this.onComplete}>Select
                        </Button>
                    </Segment>
                </Modal.Actions>
            </div>
        );
    }
}

export default MDB;
