import React, {Component} from 'react'
import {getState, putData, WFSRV_BACKEND} from '../../shared/tools';
import { Menu, Segment, Dropdown, Button, Label } from 'semantic-ui-react'
import LangSelector from "../../components/LangSelector";
import MediaPlayer from "../../components/Media/MediaPlayer";

class LangCheck extends Component {

    state = {
        disabled: true,
        langcheck: {},
        languages: {},
        lang_data: "",
        file_name: "",
        newlangs: true,
        player: null,
        sending: false,
        source: "",
    };

    getLangState = () => {
        getState(`state/langcheck`, (langcheck) => {
            this.setState({langcheck, newlangs: false});
        });
    };

    selectState = (state) => {
        console.log(state);
        const {languages, file_name} = state;
        this.setState({languages, file_name, disabled: false, lang_data: state});
        this.LangSelector.updateLangs(state);
    };

    setLang = (lang, state) => {
        console.log(":: Got lang: ",lang, state);
        const {langcheck,languages} = this.state;
        languages[lang] = state;
        this.setState({languages});
        if(state && Object.keys(langcheck).length > 0)
            this.setSource(lang);
    };

    setSource = (lang) => {
        const {file_name,lang_data} = this.state;
        let ot = lang_data.language === lang ? "o" : "t";
        let name = lang + '_' + ot + file_name.substring(5) + '.mp3';
        let url = `${WFSRV_BACKEND}/backup/tmp/carbon`;
        let source = `${url}/${name}`;
        this.state.player.setSrc(source);
        this.state.player.play();
        console.log(":: Set source: ",lang, name);
    };

    getPlayer = (player) => {
        console.log(":: LangCheck - got player: ", player);
        this.setState({player});
    };

    sendLangs = () => {
        const {lang_data} = this.state;
        console.log(":: LangChek - sending languages data: ", lang_data);
        this.setState({ sending: true, disabled: true, newlangs: true});
        putData(`${WFSRV_BACKEND}/workflow/languages`, lang_data, (cb) => {
            console.log(":: LangCheck - workflow respond: ",cb);
            setTimeout(() => this.setState({sending: false, lang_data: ""} ), 3000);
        });
    };

    render() {

        let langcheck_option = Object.keys(this.state.langcheck).map((id, i) => {
            let state = this.state.langcheck[id];
            if(!state.finished) return false;
            let name = state.file_name;
            return ({ key: id, text: name, value: state })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Label  attached='top' className="trimmed_label">Langcheck</Label>
                <MediaPlayer player={this.getPlayer} type='audio/mp3' />
                <LangSelector onRef={ref => (this.LangSelector = ref)} onGetLang={this.setLang} />
                <Menu secondary >
                    <Menu.Item>
                        <Dropdown
                            className="langcheck_dropdown"
                            error={this.state.disabled}
                            disabled={this.state.sending}
                            scrolling={false}
                            placeholder="Select File To Check:"
                            selection
                            value={this.state.lang_data}
                            options={langcheck_option}
                            onChange={(e,{value}) => this.selectState(value)}
                            onClick={() => this.getLangState()}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <Button positive disabled={this.state.disabled}
                                onClick={this.sendLangs}
                                loading={this.state.sending}>Send
                        </Button>
                    </Menu.Item>
                </Menu>
            </Segment>
        );
    }
}

export default LangCheck;