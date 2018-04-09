import React, { Component } from 'react';
import moment from 'moment';
import { Segment, Table, Message, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import MediaPlayer from "../Media/MediaPlayer";
import TrimmerControls from "./TrimmerControls";
import InoutControls from "./InoutControls";
import {putData} from "../shared/tools";

export default class MediaTrimmer extends Component {

    state = {
        lelomikud: 0,
        player: null,
        trim_meta: {},
    };

    componentDidMount() {
        let data = this.props.ingest_meta;
        let wfid = "t"+moment().format('X');
        let date = moment.unix(wfid.substr(1)).format("YYYY-MM-DD");
        let line = data.line;
        let originalsha1 = data.original.format.sha1;
        let proxysha1 = data.proxy.format.sha1;
        //let inouts = {"inpoints": []};
        //let outpoints = {"outpoints": []};
        let filename = data.stop_name;
        let censored = (this.props.mode == "censor") ? true : false;
        //let buffer = (this.props.mode == "wfadmin") ? true : false;
        let secured = (data.wfstatus.secured) ? true : false;
        var trim_meta = {
            "trim_id":wfid, "date":date, "file_name":filename,
            "parent": { "id": data.capture_id, "capture_id": data.capture_id, "original_sha1": originalsha1, "proxy_sha1": proxysha1, "file_name":filename, "source":this.props.source_meta },
            "line":line, "inpoints": [], "outpoints": [],
            "wfstatus": { "aricha":false, "buffer":false, "trimmed":false, "renamed":false, "wfsend":false, "removed":false, "kmedia":false, "backup":false, "metus":false, "censored":censored, "secured":secured }
        };
        this.setState({trim_meta: trim_meta});
    };

    getPlayer = (player) => {
        console.log(":: Trimmer - got player: ", player);
        this.setState({player: player});
    };

    getInouts = (inp, outp) => {
        let inpoints = [...inp];
        let outpoints = [...outp];
        this.setState({trim_meta: {...this.state.trim_meta, inpoints: inpoints, outpoints: outpoints}});
    };

    postTrimMeta = () => {
        let wfid = this.state.trim_meta.trim_id;
        putData('http://wfdb.bbdomain.org:8080/trimmer/'+this.state.trim_meta.trim_id, this.state.trim_meta, (cb) => {
            console.log(":: PUT Respond: ",cb);
            //fetch("http://wfdb.bbdomain.org:8080/hooks/trim?id="+wfid+"&spc="+this.state.lelomikud);
        });
    };

    render() {

        return (
            <Table className="table_main">
                <Table.Row>
                    <Table.Cell width={5} className="table_media">
                        <MediaPlayer player={this.getPlayer} source={this.props.source}/>
                    </Table.Cell>
                    <Table.Cell width={1} className="table_ctls">
                        <TrimmerControls player={this.state.player}/>
                    </Table.Cell>
                    <Table.Cell width={3} className="table_inouts">
                        <Segment raised textAlign='center'>
                            <InoutControls onSetPoints={this.getInouts} player={this.state.player}/>
                        </Segment>
                    </Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell><Message>{this.props.ingest_meta.stop_name}</Message></Table.Cell>
                    <Table.Cell><Button color='red' onClick={this.postTrimMeta}>Trim</Button></Table.Cell>
                    <Table.Cell></Table.Cell>
                </Table.Row>
            </Table>
        );
    }
}