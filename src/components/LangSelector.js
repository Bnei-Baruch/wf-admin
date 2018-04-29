import React, {Component, Fragment} from 'react'
import { langs_bb, language_options } from '../shared/consts';
import { Table, Flag } from 'semantic-ui-react'

class LangSelector extends Component {

    state = {
        lang_flags: {},
        languages: {},
    };

    componentDidMount() {
        this.props.onRef(this);
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

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    updateLangs(state) {
        let langs = state.languages;
        let name = state.file_name;
        console.log(":: Trigerred func", langs);
        let languages = {};
        langs_bb.map((lang) => languages[lang] = langs[lang]);
        this.setState({languages, name});
    };

    setLang = (lang) => {
        const {languages} = this.state;
        languages[lang] = !languages[lang];
        this.setState({languages});
        this.props.onGetLang({[lang]:languages[lang]});
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
            <Fragment>
                <Table className='lang_com' fixed>
                    <Table.Header>
                        <Table.Row positive={true} className="lang_tr">{lang_flags}</Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row positive={true} className="lang_tr">{lang_data}</Table.Row>
                    </Table.Body>
                </Table>
            </Fragment>
        );
    }
}

export default LangSelector;