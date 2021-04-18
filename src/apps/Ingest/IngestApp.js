import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestTrimmer from "../Trimmer/IngestTrimmer";
import IngestPresets from "./IngestPresets";
import LangSelector from "../../components/LangSelector";
import {newLanguages, putData, getData, WFDB_BACKEND, toHms, toSeconds} from "../../shared/tools";
import moment from "moment";
import mqtt from "../../shared/mqtt";
import {Label, Segment, Button, Divider, Message, ButtonGroup} from "semantic-ui-react";

class IngestApp extends Component {

    state = {
        capture: {},
        captures: {},
        check_count: 0,
        langstate: {},
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
            // We using multi and main capture to set langcheck and recovering from db
            // if admin was closed during recording
            if(source === "multi" && captures[source].isRec) {
                getData(`state/${captures[source].capture_id}`, langstate => {
                    if(langstate) {
                        console.log(":: Got langs state : ",langstate);
                        const check_count = langstate[captures[source].capture_id].length;
                        this.setState({langstate, check_count});
                    }
                });
            }
        } else {
            let services = message.data;
            for(let i=0; i<services?.length; i++) {
                if(source === "mltcap") {
                    let multi_online = services[i].alive;
                    let multi_timer = multi_online ? toHms(services[i].runtime).split(".")[0] : "00:00:00";
                    this.setState({multi_timer, multi_online});
                }
                if(source === "maincap") {
                    let single_online = services[i].alive;
                    let single_timer = single_online ? toHms(services[i].runtime).split(".")[0] : "00:00:00";
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
    };

    addLang = () => {
        let {langcheck, multi_timer, langstate, captures, check_count} = this.state;
        const languages = Object.assign({}, this.state.languages);
        const io = toSeconds(multi_timer);
        const li = captures.multi.capture_id;
        const lngs = {[io]: languages}
        if(!langstate[li]) {
            langstate[li] = []
        }
        langstate[li].push(lngs);
        console.log(":: Add langcheck: ",langstate);
        putData(`${WFDB_BACKEND}/state/${li}`, langstate, (cb) => {
            console.log(":: Add preset: ",cb);
            check_count++
            this.setState({langcheck, langstate, check_count});
        });
    };

    render() {
        const {langcheck, languages, captures, multi_timer, check_count} = this.state;
        const {multi} = captures;
        const capture_title = multi ? multi.stop_name || multi.start_name : "";
        const save_disable = JSON.stringify(languages) === JSON.stringify(langcheck.languages);

        return (
            <Fragment>
                {multi?.isRec ?
                <Segment textAlign='center' className="ingest_segment" color='green' raised>
                    <Message color='black' className='main_timer' >
                        <Label color={check_count === 0 ? 'red' : 'green'} attached="top left">{check_count}</Label>
                        {multi_timer} - {capture_title}
                    </Message>
                    {captures?.multi?.line ? <LangSelector onRef={ref => (this.lang = ref)} onGetLang={this.setLangs}/> : null}
                    {captures?.multi?.line ?
                        <ButtonGroup fluid>
                            {/*<Button positive disabled={save_disable} onClick={this.saveLang}>Save Languages</Button>*/}
                            <Button positive disabled={save_disable} onClick={this.addLang}>Add Languages</Button>
                        </ButtonGroup>
                        : null}
                </Segment> : null}
                <IngestTrimmer />
                <IngestTrimmed />
                {this.props.admin ? "" : <IngestPresets />}
            </Fragment>
        );
    }
}

export default IngestApp;
