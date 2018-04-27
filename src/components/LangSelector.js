import React, { Component } from 'react'
import { langs_bb, language_options } from '../shared/consts';
import { Table, Segment, Label, Flag, Button } from 'semantic-ui-react'

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
            lang_prop ? languages[lang] = lang_prop[lang] : languages[lang] = false;
            lang_flags[lang] = flags[0].flag;
            return true;
        });
        this.setState({languages, lang_flags});
    };

    getLangs = () => {
        this.props.onGetLangs(this.state.languages);
    };

    setLang = (lang) => {
        const {languages} = this.state;
        languages[lang] = !languages[lang];
        this.setState({languages});
    };

    resetLangs = () => {
        let languages = {};
        langs_bb.map((lang) => {
            languages[lang] = false;
            return true;
        });
        this.setState({languages});
    };

    render() {

        let lang_data = Object.keys(this.state.languages).map((lang, i) => {
            return (
                <Table.Cell key={i} selectable textAlign='center' className='lang_cell'
                            active={this.state.languages[lang]}
                            onClick={() => this.setLang(lang)}>{lang}
                </Table.Cell>
            );
        });

        let lang_flags = Object.keys(this.state.languages).map((lang, i) => {
            return (
                <Table.HeaderCell key={i} className='lang_cell'>
                    <Flag name={this.state.lang_flags[lang]} />
                </Table.HeaderCell>
            );
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='red' raised>
                <Label attached='top' className="trimmed_label" >Languages</Label>
                <Table className='lang_com' fixed>
                    <Table.Header>
                        <Table.Row positive={true} className="lang_tr">{lang_flags}</Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row positive={true} className="lang_tr">{lang_data}</Table.Row>
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='3'>
                                <Button fluid size='mini' onClick={this.resetLangs}>Clear</Button>
                            </Table.HeaderCell>
                            <Table.HeaderCell colSpan='17' textAlign='center'>
                                {this.props.file_name ? this.props.file_name : ""}
                            </Table.HeaderCell>
                            <Table.HeaderCell colSpan='3'>
                                <Button positive fluid size='mini' onClick={this.getLangs}>Save</Button>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment>
        );
    }
}

export default LangSelector;