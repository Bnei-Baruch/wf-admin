import React, { Component, Fragment } from 'react'
import { getData } from '../shared/tools';
import { Table, Container } from 'semantic-ui-react'

class Kmedia extends Component {

    state = {
        kmedia: [],
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
        getData(`kmedia/find?key=${skey}&value=${search}`, (kmedia) => {
            this.setState({kmedia});
            this.restructure(kmedia);
        });
    };

    restructure = (data) => {
        let kmedia = data;
        let json = {};

        for (let k in kmedia) {
            let c = kmedia[k];
            let ext = c.extension;
            // if(ext.match(/^(doc|docx)$/))
            //     continue;
            let name = c.file_name;
            // if(name.match(/(_declamation_|_clip_)/))
            //     continue;
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
        const langs = ["heb","rus","eng","spa","fre","ita","ger","por","trk","bul","geo","ron","hun","swe","lit","hrv","jpn","slv","pol","nor","lav","ukr","chn"];
            let kmedia_data = Object.keys(this.state.json).map((id) => {
                let data = this.state.json;
                if(data[id]["mp3"]) {
                    let languages = langs.map((lang) => {
                            let ex = data[id]["mp3"].hasOwnProperty(lang);
                            return (
                                <Table.Cell key={lang} disabled  positive={ex} >{lang}</Table.Cell>
                            )
                        });
                    return (
                        <Fragment>
                            <Table.Row key={id} className="monitor_tr" ><Table.Cell colSpan='23' >{id}</Table.Cell></Table.Row>
                            <Table.Row>{languages}</Table.Row>
                        </Fragment>
                    );
                }
            });

        return (
            <Container textAlign='center'>
                <Table compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell colSpan='23'>File Name</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {kmedia_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default Kmedia;