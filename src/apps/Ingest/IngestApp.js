import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestTrimmer from "../Trimmer/IngestTrimmer";
import IngestPresets from "./IngestPresets";
import LangSelector from "../../components/LangSelector";
import {getData, newLanguages, putData, WFDB_BACKEND} from "../../shared/tools";
import moment from "moment";
import {Label, Segment, Button, Divider} from "semantic-ui-react";

class IngestApp extends Component {

    state = {
        capture: {},
        ival: null,
        languages: {},
        langcheck: {languages: {}},
    };

    componentDidMount() {
        this.newCheck();
        let ival = setInterval(() =>
            getData('ingest/find?key=date&value='+moment().format('YYYY-MM-DD'), (data) => {
                const capture = data.find(c => !c.wfstatus.capwf && c.capture_src === "mltcap");
                const current = Object.assign({}, this.state.capture);
                if(current?.capture_id !== capture?.capture_id) {
                    this.setState({capture})
                }
                if(current?.line?.final_name !== capture?.line?.final_name) {
                    this.newCheck();
                    this.setState({capture})
                }
            }), 10000);
        this.setState({ival: ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
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
        const {capture, langcheck, languages} = this.state;
        const capture_title = capture ? capture.stop_name || capture.line?.final_name || capture.start_name : "";
        const save_disable = JSON.stringify(languages) === JSON.stringify(langcheck.languages);

        return (
            <Fragment>
                {capture?.capture_id ?
                <Segment textAlign='center' className="ingest_segment" color='red' raised>
                    <Label attached='top' className="capture_label" icon='record' content={capture_title} />
                    <Divider />
                    {capture.line?.final_name !== "" ? <LangSelector onRef={ref => (this.lang = ref)} onGetLang={this.setLangs}/> : null}
                    {capture.line?.final_name !== "" ? <Button fluid positive disabled={save_disable} onClick={this.saveLang}>Save Languages</Button> : null}
                </Segment> : null}
                <IngestTrimmer />
                <IngestTrimmed />
                {this.props.admin ? "" : <IngestPresets />}
            </Fragment>
        );
    }
}

export default IngestApp;
