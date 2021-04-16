import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestTrimmer from "../Trimmer/IngestTrimmer";
import IngestPresets from "./IngestPresets";
import LangSelector from "../../components/LangSelector";
import {newLanguages, putData, WFDB_BACKEND, toHms} from "../../shared/tools";
import moment from "moment";
import mqtt from "../../shared/mqtt";
import {Label, Segment, Button, Divider, Message} from "semantic-ui-react";

class IngestApp extends Component {

    state = {
        capture: {},
        captures: {},
        ival: null,
        languages: {},
        langcheck: {languages: {}},
        multi_online: false,
        multi_timer: "00:00:00",
        out: null,
        wfst: null,
    };

    componentDidMount() {
        this.initMQTT();
        this.newCheck();
    };

    componentWillUnmount() {
        const {out, wfst} = this.state;
        mqtt.exit(out)
        mqtt.exit(wfst)
    };

    initMQTT = () => {
        const data = 'exec/service/data/#';
        const state = 'workflow/state/capture/#';
        const local = window.location.hostname !== "wfsrv.kli.one";
        const out = local ? data : 'bb/' + data;
        const wfst = local ? state : 'bb/' + state;
        this.setState({out, wfst})
        mqtt.join(out);
        mqtt.join(wfst);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        if(type === "capture") {
            const {captures} = this.state;
            console.log("[capture] Got state: ", message, " | from: " + source);
            captures[source] = message;
            this.setState({captures});
        } else {
            let services = message.data;
            if(!services) return
            for(let i=0; i<services.length; i++) {
                if(source === "mltcap") {
                    let multi_online = services[i].alive;
                    let multi_timer = multi_online ? toHms(services[i].runtime) : "00:00:00";
                    this.setState({multi_timer, multi_online});
                }
                if(source === "maincap") {
                    let single_online = services[i].alive;
                    let single_timer = single_online ? toHms(services[i].runtime) : "00:00:00";
                    this.setState({single_timer, single_online});
                }
            }
        }
    };

    newCheck = () => {
        const languages = newLanguages();
        const langcheck = {
            carbon: false,
            date: moment().format('YYYY-MM-DD'),
            file_name: "",
            finished: true,
            id: "",
            ingest: true,
            language: "heb",
            languages: newLanguages(),
            trimmed: false
        };
        this.setState({languages, langcheck})
    };

    setLangs = (lang, status) => {
        const languages = Object.assign({}, this.state.languages);
        console.log(":: Got langs: ",lang, status);
        languages[lang] = status;
        this.setState({languages})
    };

    saveLang = () => {
        const {langcheck, capture} = this.state;
        const languages = Object.assign({}, this.state.languages);
        langcheck.languages = languages;
        langcheck.id = capture.capture_id;
        langcheck.file_name = capture.line?.final_name;
        langcheck.language = capture.line.language;
        console.log(":: Save langcheck: ",langcheck);
        putData(`${WFDB_BACKEND}/state/langcheck/${capture.capture_id}`, langcheck, (cb) => {
            console.log(":: Add preset: ",cb);
            this.setState({langcheck});
        });
    }

    render() {
        const {langcheck, languages, captures, multi_timer, multi_online} = this.state;
        const {multi} = captures;
        const capture_title = multi ? multi.stop_name || multi.start_name : "";
        const save_disable = JSON.stringify(languages) === JSON.stringify(langcheck.languages);

        return (
            <Fragment>
                {multi?.isRec ?
                <Segment textAlign='center' className="ingest_segment" color='red' raised>
                    <Label attached='top' className="capture_label" icon='record' content={capture_title} >
                        <Message compact
                                 negative={!multi_online}
                                 positive={multi_online}
                                 className='main_timer' >{multi_timer}</Message>
                    </Label>
                    <Divider />
                    {captures?.multi?.line ? <LangSelector onRef={ref => (this.lang = ref)} onGetLang={this.setLangs}/> : null}
                    {captures?.multi?.line ? <Button fluid positive disabled={save_disable} onClick={this.saveLang}>Save Languages</Button> : null}
                </Segment> : null}
                <IngestTrimmer />
                <IngestTrimmed />
                {this.props.admin ? "" : <IngestPresets />}
            </Fragment>
        );
    }
}

export default IngestApp;
