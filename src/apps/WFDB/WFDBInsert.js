import React, { Component, Fragment } from 'react'
import { getData } from '../../shared/tools';
import { Table, Container } from 'semantic-ui-react'
import {langs_bb} from "../../shared/consts";

class WFDBInsert extends Component {

    state = {
        insert: [],
        json: {},
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
            this.restructure(insert);
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
            this.restructure(insert);
        });
    };

    restructure = (data) => {
        let insert = data;
        let json = {};

        for (let k in insert) {
            let c = insert[k];
            let ext = c.extension;
            let name = c.file_name;
            let lng = c.language;
            let user = c.line.name ? ":"+c.line.name+" - ("+c.line.email+")" : ":";
            let n = name.split("_").splice(2).join("_") + user;
            json[n] = json[n] || {};
            json[n][ext] = json[n][ext] || {};
            json[n][ext][lng] = json[n][ext][lng] || {};
            json[n][ext][lng].filename = name;
        }
        this.setState({json})
    };

    render() {
        const languages = langs_bb;
        let insert_data = Object.keys(this.state.json).map((id) => {
            let data = this.state.json;
            let name = id.split(":")[0];
            let user = id.split(":")[1];
            let exts = Object.keys(data[id]).map((ext) => {
                let langs = languages.map((lang) => {
                    let ex = data[id][ext].hasOwnProperty(lang);
                    return (
                        <Table.Cell key={lang} disabled  positive={ex} colSpan={2}>{lang}</Table.Cell>
                    )
                });
                return (<Table.Row key={ext}><Table.Cell active colSpan={2}>{ext}</Table.Cell>{langs}</Table.Row>);
            });
            return (
                <Fragment key={id}>
                    <Table.Row key={id} className="monitor_tr" >
                        <Table.Cell colSpan={languages.length + 1}><strong>{name}</strong></Table.Cell>
                        <Table.Cell colSpan={languages.length + 1}><i>{user}</i></Table.Cell>
                    </Table.Row>
                    {exts}
                </Fragment>
            );
        });

        return (
            <Container textAlign='center'>
                <Table compact='very' selectable fixed basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell colSpan={languages.length + 1}>File Name</Table.HeaderCell>
                            <Table.HeaderCell colSpan={languages.length + 1}>Operator</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {insert_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default WFDBInsert;