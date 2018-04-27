import React, { Component } from 'react'
import { langs_bb, language_options } from '../shared/consts';
import { Table, Segment, Label, Flag } from 'semantic-ui-react'

class LangSelector extends Component {

    state = {
        lang_flags: {},
        languages: {},
    };

    componentDidMount() {
        let languages = {};
        let lang_flags = {};
        let lang_prop = this.props.languages;
        langs_bb.map((lang) => {
            let flags = language_options.filter(flag => flag.value === lang);
            lang_prop ?  languages[lang] = lang_prop[lang] : languages[lang] = false;
            lang_flags[lang] = flags[0].flag;
            return true
        });
        this.setState({languages, lang_flags});
    };

    langToggle = (id) => {
        console.log(":: Lang: ", id);
        let lang = this.state.languages;
        lang[id] = !lang[id];
        this.setState({languages:{...lang}});
    };

    render() {

        let lang_data = Object.keys(this.state.languages).map((id, i) => {
            return (
                <Table.Cell key={i} selectable textAlign='center' className='lang_cell'
                            active={this.state.languages[id]}
                            onClick={() => this.langToggle(id)}>{id}
                </Table.Cell>
            );
        });

        let lang_flags = Object.keys(this.state.languages).map((id, i) => {
            return (
                <Table.HeaderCell key={i} className='lang_cell'>
                    <Flag name={this.state.lang_flags[id]} />
                </Table.HeaderCell>
            );
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='red' raised>
                <Label  attached='top' className="trimmed_label">Languages</Label>
                <Table className='lang_com' fixed>
                    <Table.Header>
                        <Table.Row positive={true} className="lang_tr">{lang_flags}</Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row positive={true} className="lang_tr">{lang_data}</Table.Row>
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default LangSelector;