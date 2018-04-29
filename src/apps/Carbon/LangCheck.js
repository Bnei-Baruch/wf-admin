import React, {Component} from 'react'
import {getConv} from '../../shared/tools';
import { Menu, Segment, Dropdown, Button, Label } from 'semantic-ui-react'
import LangSelector from "../../components/LangSelector";
import MediaPlayer from "../../components/Media/MediaPlayer";

class LangCheck extends Component {

    state = {
        disabled: true,
        langcheck: {},
        languages: {},
        file_name: "",
        newlangs: true,
        player: null,
        sending: false,
        source: "",
    };

    getLangState = () => {
        getConv(`state/langcheck`, (langcheck) => {
            this.setState({langcheck, newlangs: false});
        });
    };

    selectState = (state) => {
        console.log(state);
        const {languages, file_name} = state;
        this.setState({languages, file_name, disabled: false});
        this.LangSelector.updateLangs(state);
    };

    setLang = (lang, state) => {
        console.log(":: Got lang: ",lang, state);
        const {languages} = this.state;
        languages[lang] = state;
        this.setState({languages});
        if(state) this.setSource(lang);
    };

    setSource = (lang) => {
        const {file_name} = this.state;
        let name = lang + '_t' + file_name.substring(5) + '.mp3';
        let url = 'http://wfserver.bbdomain.org/backup/tmp/kmedia/2018-04-29';
        let source = `${url}/${name}`;
        //this.setState({source});
        this.state.player.setSrc(source);
        console.log(":: Set source: ",lang, name);
    };

    getPlayer = (player) => {
        console.log(":: LangCheck - got player: ", player);
        this.setState({player});
    };

    sendLangs = () => {
        console.log(":: LangChek - sending languages");
        this.setState({ sending: true, disabled: true, newlangs: true});
        setTimeout(() => this.setState({sending: false }), 3000);
    };

    render() {

        let langcheck_option = this.state.newlangs ? [] : Object.keys(this.state.langcheck).map((id, i) => {
            let state = this.state.langcheck[id];
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
                            scrolling={false}
                            placeholder="Select File To Check:"
                            selection
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