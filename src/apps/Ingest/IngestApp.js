import React, {Component, Fragment} from 'react'
import IngestTrimmed from "./IngestTrimmed";
import IngestTrimmer from "../Trimmer/IngestTrimmer";
import IngestPresets from "./IngestPresets";
import LangSelector from "../../components/LangSelector";
import {getData} from "../../shared/tools";
import moment from "moment";
import {Label, Segment} from "semantic-ui-react";

class IngestApp extends Component {

    state = {
        capture: null,
        ival: null,
    };

    componentDidMount() {
        let ival = setInterval(() =>
            getData('ingest/find?key=date&value='+moment().format('YYYY-MM-DD'), (data) => {
                const capture = data.find(c => !c.wfstatus.capwf && c.capture_src === "mltcap");
                this.setState({capture})
            }), 10000);
        this.setState({ival: ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    setLangs = (langs) => {
        console.log(":: Got langs: ",langs);
    };

    render() {
        const {capture} = this.state;
        const capture_title = capture ? capture.stop_name || capture.line?.final_name || capture.start_name : ""

        return (
            <Fragment>
                {this.props.admin ? "" : <IngestPresets />}
                {capture ?
                <Segment textAlign='center' className="ingest_segment" color='red' raised>
                    <Label  attached='top' className="trimmed_label">{capture_title}</Label>
                    {capture.line?.final_name !== "" ?
                        <LangSelector attached onRef={ref => (this.lang = ref)} onGetLang={this.setLangs}/> : null}
                </Segment> : null}
                <IngestTrimmer />
                <IngestTrimmed />
            </Fragment>
        );
    }
}

export default IngestApp;
