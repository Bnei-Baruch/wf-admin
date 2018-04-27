import React, { Component } from 'react'
import { getData } from '../shared/tools';
import { language_options } from '../shared/consts';
import { Table, Segment, Flag } from 'semantic-ui-react'

class LangSelector extends Component {

    state = {
        langs_flags: {},
        languages: {},
    };

    componentDidMount() {
        const lang_data = ["heb","rus","eng","spa","fre","ita","ger","por","trk","bul","geo","ron","hun","swe","lit","hrv","jpn","slv","pol","nor","lav","ukr","chn"];
        let languages = {};
        let langs_flags = {};
        lang_data.map((lang) => {
            let flags = language_options.filter(flag => flag.value === lang);
            languages[lang] = false;
            langs_flags[lang] = flags[0].flag;
            return true
        });
        this.setState({languages, langs_flags});
        //this.getKmediaData("date", this.props.date);
    };

    componentDidUpdate(prevProps) {
        // let prev = [prevProps.date, prevProps.skey, prevProps.svalue];
        // let next = [this.props.date, this.props.skey, this.props.svalue];
        // if (JSON.stringify(prev) !== JSON.stringify(next))
        //     this.getKmediaData(this.props.skey, this.props.svalue);
    };

    getKmediaData = (skey, svalue) => {
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`kmedia/find?key=${skey}&value=${search}`, (kmedia) => {
            console.log(":: Kmedia DB Data: ",kmedia);
            this.setState({kmedia});
            this.restructure(kmedia);
        });
    };

    langToggle = (id) => {
        console.log(":: Lang: ", id);
        let lang = this.state.languages;
        lang[id] = !lang[id];
        this.setState({languages:{...lang}});
    };

    render() {

        let langs_data = Object.keys(this.state.languages).map((id, i) => {
            return (
                <Table.Cell key={i} selectable textAlign='center' className='lang_cell'
                            active={this.state.languages[id]}
                            onClick={() => this.langToggle(id)}>{id}</Table.Cell>
            );
        });

        let langs_flags = Object.keys(this.state.languages).map((id, i) => {
            return (
                <Table.HeaderCell key={i}><Flag name={this.state.langs_flags[id]} /></Table.HeaderCell>
            );
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Table fixed className='lang_com'>
                    <Table.Header>
                        <Table.Row>{langs_flags}</Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row positive={true} className="lang_tr">{langs_data}</Table.Row>
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default LangSelector;