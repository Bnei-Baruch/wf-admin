import React, { Component, Fragment } from 'react'

import { getData, IVAL } from '../../shared/tools';
import { Table, Container } from 'semantic-ui-react'
import {langs_bb} from '../../shared/consts';

class MonitorKmedia extends Component {

    state = {
        kmedia: [],
        json: {},
        ival: null,
    };

    componentDidMount() {
        let ival = setInterval(() =>
            getData('kmedia/find?key=date&value='+new Date().toISOString().slice(0,10), (data) => {
                if (JSON.stringify(this.state.kmedia) !== JSON.stringify(data)) {
                    //let kmdeia = data.filter(k => k.source.match(/(insert|carbon|langcheck)/));
                    this.setState({kmedia: data});
                    this.restructure(data);
                }
            }), IVAL
        );
        this.setState({ival: ival});
    };


    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            this.restructure(this.state.kmedia);
        }
    };

    restructure = (data) => {
        let kmedia = data;
        let json = {};
        const {insert, ingest, aricha} = this.props;
        for (let k in kmedia) {
            let c = kmedia[k];
            let src = c.source;
            if(insert && src === "insert")
                continue;
            if(ingest && src === "ingest")
                continue;
            if(aricha && src === "aricha")
                continue;
            let ext = c.extension;
            let name = c.file_name;
            let lng = c.language;
            let n = name.split("_").splice(2).join("_");
            json[n] = json[n] || {};
            json[n][ext] = json[n][ext] || {};
            json[n][ext][lng] = json[n][ext][lng] || {};
            json[n][ext][lng].filename = name;
        }
        this.setState({json: json})
    };

    render() {
        const languages = langs_bb;

        let full_kmedia_data = Object.keys(this.state.json).map((id, i) => {
            let data = this.state.json;
            let exts = Object.keys(data[id]).map((ext) => {
                let langs = languages.map((lang) => {
                    let ex = data[id][ext].hasOwnProperty(lang);
                    return (
                        <Table.Cell key={lang} disabled  positive={ex} >{lang}</Table.Cell>
                    )
                });
                return (<Table.Row key={ext}><Table.Cell active>{ext}</Table.Cell>{langs}</Table.Row>);
            });
            return (
                <Fragment key={i}>
                    <Table.Row key={id} className="monitor_tr" ><Table.Cell colSpan={languages.length + 1}>{id}</Table.Cell></Table.Row>
                    {exts}
                </Fragment>
            );
        });

        let short_kmedia_data = Object.keys(this.state.json).map((id, i) => {
            let data = this.state.json;
            if(data[id]["mp3"]) {
                let langs = languages.map((lang) => {
                    let ex = data[id]["mp3"].hasOwnProperty(lang);
                    return (
                        <Table.Cell key={lang} disabled positive={ex} >{lang}</Table.Cell>
                    )
                });
                return (
                    <Fragment key={i}>
                        <Table.Row className="monitor_tr" ><Table.Cell colSpan={languages.length} >{id}</Table.Cell></Table.Row>
                        <Table.Row>{langs}</Table.Row>
                    </Fragment>
                );
            } return true;
        });

        return (

            <Container textAlign='center'>
                <u>Archive</u>
                <Table compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell colSpan={this.props.kmedia_full ? languages.length + 1 : languages.length}>File Name</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.props.kmedia_full ? full_kmedia_data : short_kmedia_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default MonitorKmedia;
