import React, { Component } from 'react';
import moment from 'moment';
import { Segment, Table, Button, Checkbox } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import TrimmerControls from "./TrimmerControls";
import InoutControls from "./InoutControls";
import {getConv, putData, WFDB_STATE, WFSRV_BACKEND} from "../../shared/tools";

export default class TrimmerApp extends Component {

    state = {
        lelomikud: false,
        player: null,
        trim_meta: {},
        ioValid: false,
        loading: false,
    };

    componentDidMount() {
        console.log("-- MediaTrimmer Did Mount: ", this.props.file_data);
        if(this.props.source_meta === "trimmed") {
            // Make meta from trimmmed files
            let data = this.props.file_data;
            let wfid = "t"+moment().format('X');
            let date = moment.unix(wfid.substr(1)).format("YYYY-MM-DD");
            let line = data.line;
            let originalsha1 = data.original.format.sha1;
            let proxysha1 = data.proxy.format.sha1;
            let filename = data.file_name;
            let censored = this.props.mode === "censor";
            let buffer = this.props.mode === "wfadmin";
            let secured = data.wfstatus.secured;
            let trim_meta = {
                trim_id:wfid, date:date, file_name:filename,
                parent: {
                    id: data.trim_id,
                    capture_id: data.parent.capture_id,
                    original_sha1: originalsha1,
                    proxy_sha1: proxysha1,
                    file_name:filename,
                    source:this.props.source_meta
                },
                line: line, inpoints: [], outpoints: [],
                wfstatus: {
                    aricha: false,
                    buffer: buffer,
                    fixed: false,
                    trimmed: false,
                    renamed: false,
                    wfsend: false,
                    removed: false,
                    kmedia: false,
                    backup: false,
                    metus: false,
                    censored:censored,
                    secured:secured
                }
            };
            this.setState({trim_meta: trim_meta});
        } else {
            // Make meta from captured files
            let data = this.props.file_data;
            let wfid = "t" + moment().format('X');
            let date = moment.unix(wfid.substr(1)).format("YYYY-MM-DD");
            let line = data.line;
            let originalsha1 = data.original.format.sha1;
            let proxysha1 = data.proxy.format.sha1;
            let filename = data.stop_name;
            let buffer = this.props.mode === "wfadmin";
            let secured = data.wfstatus.secured;
            let trim_meta = {
                trim_id: wfid, date: date, file_name: filename,
                parent: {
                    id: data.capture_id,
                    capture_id: data.capture_id,
                    original_sha1: originalsha1,
                    proxy_sha1: proxysha1,
                    file_name: filename,
                    source: this.props.source_meta
                },
                line: line, inpoints: [], outpoints: [],
                wfstatus: {
                    aricha: false,
                    buffer: buffer,
                    trimmed: false,
                    renamed: false,
                    wfsend: false,
                    removed: false,
                    kmedia: false,
                    backup: false,
                    metus: false,
                    censored: false,
                    secured: secured
                }
            };
            this.setState({trim_meta: trim_meta});
        }
        //TODO: Make meta from dgima source
    };

    getPlayer = (player) => {
        console.log(":: Trimmer - got player: ", player);
        this.setState({player: player});
    };

    getInouts = (inpoints, outpoints) => {
        this.setState({ioValid: true});
        for(let i=0; i<inpoints.length; i++) {
            if(inpoints[i] > outpoints[i]) {
                this.setState({ioValid: false});
            }
        }
        this.setState({trim_meta: {...this.state.trim_meta, inpoints, outpoints}});
    };

    postTrimMeta = () => {
        this.setIopState();
        let {trim_meta} = this.state;
        this.setState({ioValid: false, loading: true});
        setTimeout(() => { this.props.closeModal() }, 2000);
        if(this.state.lelomikud) trim_meta.line.artifact_type = "LELO_MIKUD";
        putData(`${WFSRV_BACKEND}/workflow/trim`, trim_meta, (cb) => {
            console.log(":: Trimmer - trim respond: ",cb);
            if(cb.status !== "ok") {
                alert("Trimmer: Something goes wrong!");
            }
        });
    };

    getIopState = () => {
        getConv('state/trimmer/'+this.props.mode, (iop) => {
            if(iop.inpoints.length > 0)
                this.InoutControls.restoreIop(iop)
        });
    };

    setIopState = () => {
        const {inpoints, outpoints} = this.state.trim_meta;
        let iop = {inpoints, outpoints};
        console.log(":: setIopState", iop);
        putData(`${WFDB_STATE}/state/trimmer/`+this.props.mode, iop, (cb) => {
            console.log(":: setIopState respond: ",cb);
        });
    };

    toggleLelomikud = () => this.setState({ lelomikud: !this.state.lelomikud });

    render() {
        return (
            <Table className='table_main'>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell width={5} className='table_media'>
                            <MediaPlayer
                                player={this.getPlayer}
                                source={this.props.source} type='video/mp4' />
                        </Table.Cell>
                        <Table.Cell width={1} className='table_ctls'>
                            <TrimmerControls
                                player={this.state.player} />
                        </Table.Cell>
                        <Table.Cell width={3} className='table_inouts'>
                            <Button.Group attached='top' size='mini'>
                                <Button onClick={this.setIopState}>Save</Button>
                                <Button onClick={this.getIopState}>Restore</Button>
                            </Button.Group>
                            <Segment attached raised textAlign='center' className='inout_content'>
                                <InoutControls onRef={ref => (this.InoutControls = ref)}
                                    onSetPoints={this.getInouts}
                                    player={this.state.player}
                                    inpoints={this.state.trim_meta.inpoints}
                                    outpoints={this.state.trim_meta.outpoints} />
                            </Segment>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <Segment color='blue' textAlign='center' raised >
                                <b>{this.state.trim_meta.file_name}</b>
                            </Segment>
                        </Table.Cell>
                        <Table.Cell>
                            <Checkbox label='LeloMikud' onClick={this.toggleLelomikud} checked={this.state.lelomikud} />
                        </Table.Cell>
                        <Table.Cell textAlign='center'>
                            <Button size='big' color='red'
                                    disabled={!this.state.ioValid}
                                    loading={this.state.loading}
                                    onClick={this.postTrimMeta}>Trim
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        );
    }
}