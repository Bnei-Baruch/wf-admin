import React, { Component, Fragment } from 'react'
import { getData } from '../../shared/tools';
import { Table, Container } from 'semantic-ui-react'

class WFDBInsert extends Component {

    state = {
        insert: [],
        json: {},
    };

    componentDidMount() {
        this.getKmediaData("date", this.props.date);
    };

    componentDidUpdate(prevProps) {
        let prev = [prevProps.date, prevProps.skey, prevProps.svalue];
        let next = [this.props.date, this.props.skey, this.props.svalue];
        if (JSON.stringify(prev) !== JSON.stringify(next))
            this.getKmediaData(this.props.skey, this.props.svalue);
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

    restructure = (data) => {
        let insert = data;
        let json = {};

        for (let k in insert) {
            let c = insert[k];
            let ext = c.extension;
            let name = c.file_name;
            let lng = c.language;
            let n = name.split("_").splice(2).join("_");
            json[n] = json[n] || {};
            json[n][ext] = json[n][ext] || {};
            json[n][ext][lng] = json[n][ext][lng] || {};
            json[n][ext][lng].filename = name;
        }
        this.setState({json})
    };

    render() {
        const languages = ["heb","rus","eng","spa","fre","ita","ger","por","trk","bul","geo","ron","hun","swe","lit","hrv","jpn","slv","pol","nor","lav","ukr","chn"];
        let insert_data = Object.keys(this.state.json).map((id) => {
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
                <Fragment key={id}>
                    <Table.Row key={id} className="monitor_tr" ><Table.Cell colSpan='24' >{id}</Table.Cell></Table.Row>
                    {exts}
                </Fragment>
            );
        });

        return (
            <Container textAlign='center'>
                <Table compact='very' selectable fixed basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell colSpan='24'>File Name</Table.HeaderCell>
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