import React, { Component } from 'react';
import { Table, Popup, Icon } from 'semantic-ui-react'
import { fetchUnits, toHms, getLang } from '../../shared/tools';
import NameHelper from './NameHelper';

class MdbData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            units: [],
            active: null,
        };
    };

    componentDidMount() {
        console.log("--DidUMount----");
        const {content_type,start_date,end_date} = this.props;
        let path = ['page_size=1000', `start_date=${start_date}`, `end_date=${end_date}`, `content_type=${content_type}`];
            if(content_type === "LESSON_PART") path.push('content_type=FULL_LESSON', 'content_type=WOMEN_LESSON');
            if (content_type === "LECTURE") path.push('content_type=FRIENDS_GATHERING', 'content_type=EVENT_PART');
            fetchUnits('?'+path.join('&'), (data) => this.setState({units: data.data, active: null}));
    };

    componentDidUpdate(prevProps) {
        console.log("--DidUpdate----");
        const {content_type, start_date, end_date, input_uid, language, upload_type} = this.props;
        let next = [content_type, start_date, input_uid, language, upload_type];
        let prev = [prevProps.content_type, prevProps.start_date, prevProps.input_uid, prevProps.language, prevProps.upload_type];
        let path = ['page_size=1000', `start_date=${start_date}`, `end_date=${end_date}`, `content_type=${content_type}`];
        if (JSON.stringify(prev) !== JSON.stringify(next)) {
            if(content_type === "LESSON_PART") path.push('content_type=FULL_LESSON', 'content_type=WOMEN_LESSON');
            if (content_type === "LECTURE") path.push('content_type=FRIENDS_GATHERING', 'content_type=EVENT_PART');
            fetchUnits('?'+path.join('&'), (data) => {
                if(input_uid) data.data = data.data.filter((unit) => unit.uid === input_uid);
                this.setState({units: data.data, active: null})
            });
        }
    };

    handleClick = (unit) => {
        this.props.onUidSelect(unit);
        this.setState({active: unit.uid});
    };

    render() {
        console.log("--MdbData Render--");

        const {language,upload_type,metadata} = this.props;
        const {units,active} = this.state;
        let lang = getLang(language);

        let uidList = units.map((unit) => {
            const {number,part,capture_date,film_date,duration} = unit.properties;
            let name = lang && unit.i18n[lang] ? unit.i18n[lang].name : unit.i18n.he ? unit.i18n.he.name : "Name not found";
            let a = active === unit.uid ? 'active' : '';
            let n = number || "-";
            let p = part === -1 ? "full" : part;
            let np = n !== "-" ? '( n: ' + n + ' p: ' + p + ' )' : "";
            let date = capture_date || film_date;
            let d = upload_type.match(/^(article|publication)$/) ? "" : toHms(duration);
            let rtlclass = lang === "he" || !lang ? "rtl-dir" : "";
            return (
                <Table.Row className={a} key={unit.id} onClick={() => this.handleClick(unit)}>
                    <Table.Cell>
                        <Popup
                            trigger={upload_type.match(/^(aricha|article|publication)$/) ? "" : <Icon link name='help' />}
                            mountNode={document.getElementById("ltr-modal-mount")}
                            flowing
                            position='bottom left'
                            hoverable >
                            <NameHelper id={unit.id} {...metadata} />
                        </Popup>
                    </Table.Cell>
                    <Table.Cell>{d}</Table.Cell>
                    <Table.Cell textAlign='left' >{np}</Table.Cell>
                    <Table.Cell textAlign='right' className={rtlclass}>{name}</Table.Cell>
                    <Table.Cell>{date}</Table.Cell>
                </Table.Row>
            );
        });
        return (
            <Table selectable color='grey' key='teal' >
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
        );
    }
}

export default MdbData;