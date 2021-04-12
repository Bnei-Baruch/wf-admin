import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestTrimmer from "../Trimmer/IngestTrimmer";
import IngestPresets from "./IngestPresets";
import LangSelector from "../../components/LangSelector";
import {newLanguages, putData, WFDB_BACKEND, toHms, toSeconds} from "../../shared/tools";
import moment from "moment";
import mqtt from "../../shared/mqtt";
import {Label, Segment, Button, Divider, Message, ButtonGroup} from "semantic-ui-react";

class IngestApp extends Component {

    state = {
        capture: {},
        captures: {},
        ingest: {},
        languages: {},
        langcheck: {languages: {}},
        multi_online: false,
        multi_timer: "00:00:00"
    };

    componentDidMount() {
        this.initMQTT();
        this.newCheck();
    };

    componentWillUnmount() {
        mqtt.exit('workflow/state/capture/#')
        mqtt.exit('exec/service/data/#')
    };

    initMQTT = () => {
        const watch = 'exec/service/data/#';
        const local = window.location.hostname !== "shidur.kli.one";
        const topic = local ? watch : 'bb/' + watch;
        mqtt.join(topic);
        mqtt.join('workflow/state/capture/#');
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, false)
        //this.onMqttState();
    };

    onMqttMessage = (message, type, source) => {
        if(type === "capture") {
            const {captures} = this.state;
            console.log("[capture] Got state: ", message, " | from: " + source);
            captures[source] = message;
            this.setState({captures});
        } else {
            let services = message.data;
            for(let i=0; i<services?.length; i++) {
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

    onMqttState = () => {
        mqtt.mq.on('state', (data, source) => {
            const {captures} = this.state;
            console.log("[capture] Got state: " + data + " | from: " + source);
            captures[source] = data;
            this.setState({captures});
        });
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
        const {langcheck, multi_timer, ingest, captures} = this.state;
        const languages = Object.assign({}, this.state.languages);
        const io = toSeconds(multi_timer);
        const li = captures.multi.capture_id;
        const lngs = {[io]: languages}
        if(!ingest[li]) {
            ingest[li] = []
        }
        ingest[li].push(lngs);
        console.log(":: Add langcheck: ",ingest);
        putData(`${WFDB_BACKEND}/state/ingest`, ingest, (cb) => {
            console.log(":: Add preset: ",cb);
            this.setState({langcheck, ingest});
        });
    };

    render() {
        const {langcheck, languages, captures, multi_timer, multi_online} = this.state;
        const {multi} = captures;
        const capture_title = multi ? multi.stop_name || multi.start_name : "";
        const save_disable = JSON.stringify(languages) === JSON.stringify(langcheck.languages);

        return (
            <Fragment>
                {multi?.isRec ?
                <Segment textAlign='center' className="ingest_segment" color='green' raised>
                    <Message color='black' className='main_timer' >{multi_timer} - {capture_title}</Message>
                    {captures?.multi?.line ? <LangSelector onRef={ref => (this.lang = ref)} onGetLang={this.setLangs}/> : null}
                    {captures?.multi?.line ?
                        <ButtonGroup fluid>
                            <Button positive disabled={save_disable} onClick={this.saveLang}>Save Languages</Button>
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
