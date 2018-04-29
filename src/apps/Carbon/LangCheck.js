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
        player: null,
        source: "",
    };

    getLangState = () => {
        getConv(`state/langcheck`, (langcheck) => {
            this.setState({langcheck});
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
        this.state.player.domNode.setSrc(source);
        console.log(":: Set source: ",lang, name);
    };

    getPlayer = (player) => {
        console.log(":: LangCheck - got player: ", player);
        this.setState({player});
    };

    render() {

        let langcheck_option = Object.keys(this.state.langcheck).map((id, i) => {
            let state = this.state.langcheck[id];
            let name = state.file_name;
            return ({ key: id, text: name, value: state })
        });

        let filecheck_option = Object.keys(this.state.languages).map((lang, i) => {
            let name = this.state.file_name;
            return ({ key: lang, text: lang+name, value: lang })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Label  attached='top' className="trimmed_label">{this.state.file_name ? this.state.file_name : "Lang Check"}</Label>
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
                        <Dropdown
                            className="langcheck_dropdown"
                            error={this.state.disabled}
                            scrolling={false}
                            placeholder="Select Lang To Check:"
                            selection
                            options={langcheck_option}
                            onChange={(e,{value}) => this.selectState(value)}
                            onClick={() => this.getLangState()}
                        >
                        </Dropdown>
                    </Menu.Item>
                </Menu>
                <MediaPlayer player={this.getPlayer} source={this.state.source} type='audio/mp3' />
            </Segment>
        );
    }
}

export default LangCheck;