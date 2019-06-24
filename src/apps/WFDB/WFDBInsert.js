import React, { Component, Fragment } from 'react'
import moment from 'moment';
import {getData, getEndpoint, MDB_UNIT_URL} from '../../shared/tools';
import {Table} from 'semantic-ui-react'

class WFDBInsert extends Component {

    state = {
        insert: [],
    };

    componentDidMount() {
        this.getKmediaData("date", this.props.date);
    };

    getKmediaData = (skey, svalue) => {
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`insert/find?key=${skey}&value=${search}`, (insert) => {
            console.log(":: Insert DB Data: ",insert);
            this.setState({insert});
        });
    };

    searchData = (tab) => {
        const {skey,svalue} = this.props;
        console.log(tab);
        let search = this.props.skey === "date" ? this.props.date : svalue;
        let endpoint = skey === "uid" ? "line" : "find";
        if(!search) return;
        getData(`insert/${endpoint}?key=${skey}&value=${search}`, (insert) => {
            console.log(":: Insert DB Data: ",insert);
            this.setState({insert});
        });
    };

    getParent = (id) => {
        let ep = getEndpoint(id);
        getData(`${ep}/${id}`, data => {
            console.log(data);
        })
    };

    render() {
        let insert_data = this.state.insert.map((data) => {
            const {id,insert_id,insert_name,send_id,upload_type,line} = data;
            const {name,email,uid,unit_id} = line;
            let user = name ? name+" - ("+email+")" : "";
            let time = moment.unix(insert_id.substr(1)).format("HH:mm:ss") || "";
            let href = unit_id ? `${MDB_UNIT_URL}/${unit_id}` : `${MDB_UNIT_URL}/?query=${uid}`;
            let link = (<a target="_blank" rel="noopener noreferrer" href={href}>{uid}</a>);
            return (
                <Table.Row key={id} className="monitor_tr">
                    <Table.Cell onClick={() => console.log(data)}>{insert_id}</Table.Cell>
                    <Table.Cell>{link}</Table.Cell>
                    <Table.Cell onClick={() => this.getParent(send_id)}>{send_id}</Table.Cell>
                    <Table.Cell>{insert_name}</Table.Cell>
                    <Table.Cell>{upload_type}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{user}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Fragment>
                <Table compact='very' selectable basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>UID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Parent ID</Table.HeaderCell>
                            <Table.HeaderCell width={7}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Upload Type</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={5}>Operator</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {insert_data}
                    </Table.Body>
                </Table>
            </Fragment>
        );
    }
}

export default WFDBInsert;