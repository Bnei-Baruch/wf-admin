import React, { Component } from 'react';
import { Table, Popup, Icon } from 'semantic-ui-react'
import { fetchUnits, fetchCollections, toHms, getLang } from '../shared/tools';
import NameHelper from './NameHelper';

class MdbData extends Component {

    constructor(props) {
        super(props);
        this.state = {
            units: [],
            active: null,
        };
    };

    componentDidUpdate(prevProps) {
        console.log("--DidUpdate----");
        let prev = [prevProps.content_type, prevProps.start_date, prevProps.input_uid, prevProps.language, prevProps.upload_type];
        let next = [this.props.content_type, this.props.start_date, this.props.input_uid, this.props.language, this.props.upload_type];
        if (JSON.stringify(prev) !== JSON.stringify(next)) {
            if(this.props.content_type === "LESSON_PART") {
                var path = `?&page_size=1000&content_type=FULL_LESSON&content_type=WOMEN_LESSON&content_type=${this.props.content_type}&start_date=${this.props.start_date}&end_date=${this.props.end_date}`
            } else if (this.props.content_type === "OTHER") {
                var path = `?&page_size=1000&content_type=FRIENDS_GATHERING&content_type=EVENT_PART&content_type=LECTURE&start_date=${this.props.start_date}&end_date=${this.props.end_date}`
            } else {
                var path = `?&page_size=1000&content_type=${this.props.content_type}&start_date=${this.props.start_date}&end_date=${this.props.end_date}`
            }
            if(this.props.content_type === "LESSON_PART" && !this.props.input_uid) {
                //fetchUnits(path, (data) => fetchCollections(data, (units) => this.setState({units: units.data})))
                fetchUnits(path, (data) => this.setState({units: data.data, active: null}))
            } else if(this.props.input_uid) {
                console.log("Got new input UID");
                let unit_uid = this.state.units.filter((unit) => unit.uid == this.props.input_uid);
                this.setState({units: unit_uid, active: null });
            } else {
                fetchUnits(path, (data) => this.setState({units: data.data, active: null}))
            }
        }
    };

    handleClick = (unit) => {
        this.props.onUidSelect(unit);
        this.setState({active: unit.uid});
    };

    render() {
        console.log("--MdbData Render--");
        let lang = getLang(this.props.language);
        let uidList = this.state.units.map((unit) => {
            let name = lang && unit.i18n[lang] ? unit.i18n[lang].name : unit.i18n.he ? unit.i18n.he.name : "Name not found";
            let active = this.state.active === unit.uid ? 'active' : '';
            let num = unit.properties.number || "-";
            let part = unit.properties.part === -1 ? "full" : unit.properties.part;
            let numprt = num !== "-" ? '( n: ' + num + ' p: ' + part + ' )' : "";
            let date = unit.properties.capture_date || unit.properties.film_date;
            let duration = this.props.upload_type.match(/^(article|publication)$/) ? "" : toHms(unit.properties.duration);
            let rtlclass = lang === "he" || !lang ? "rtl-dir" : "";
            return (
                <Table.Row className={active} key={unit.id} onClick={() => this.handleClick(unit)}>
                    <Table.Cell>
                        <Popup
                            trigger={this.props.upload_type.match(/^(aricha|article|publication)$/) ? "" : <Icon link name='help' />}
                            flowing
                            position='bottom left'
                            hoverable >
                            <NameHelper id={unit.id} {...this.props.metadata} />
                        </Popup>
                    </Table.Cell>
                    <Table.Cell>{duration}</Table.Cell>
                    <Table.Cell textAlign='left' >{numprt}</Table.Cell>
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