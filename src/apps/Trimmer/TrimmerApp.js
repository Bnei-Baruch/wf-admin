import React, { Component } from 'react';
import { Segment, Table, Button, Checkbox } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import TrimmerControls from "./TrimmerControls";
import InoutControls from "./InoutControls";
import {getData, putData, WFDB_BACKEND, WFSRV_BACKEND} from "../../shared/tools";

export default class TrimmerApp extends Component {

    state = {
        ktaim: this.props.mode === "ktaim",
        lelomikud: false,
        player: null,
        trim_meta: {...this.props.trim_meta},
        ioValid: false,
        loading: false,
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
        let {trim_meta,lelomikud,ktaim} = this.state;
        this.setState({ioValid: false, loading: true});
        setTimeout(() => { this.props.closeModal() }, 2000);
        if(trim_meta.line)
            trim_meta.line.artifact_type = lelomikud ? "LELO_MIKUD" : ktaim ? "KTAIM_NIVCHARIM" : "main";
        let ep = trim_meta.parent.source === "custom" ? "drim" : "trim";
        putData(`${WFSRV_BACKEND}/workflow/${ep}`, trim_meta, (cb) => {
            console.log(":: Trimmer - trim respond: ",cb);
            if(cb.status !== "ok") {
                alert("Trimmer: Something goes wrong!");
            }
        });
    };

    getIopState = () => {
        getData('state/trimmer/'+this.props.mode, (iop) => {
            if(iop.inpoints.length > 0)
                this.InoutControls.restoreIop(iop)
        });
    };

    setIopState = () => {
        const {inpoints, outpoints} = this.state.trim_meta;
        let iop = {inpoints, outpoints};
        console.log(":: setIopState", iop);
        putData(`${WFDB_BACKEND}/state/trimmer/`+this.props.mode, iop, (cb) => {
            console.log(":: setIopState respond: ",cb);
        });
    };

    toggleLelomikud = () => this.setState({ lelomikud: !this.state.lelomikud });

    render() {
        const {mode,source} = this.props;
        const {player,trim_meta,lelomikud,ioValid,loading} = this.state;

        return (
            <Table className='table_main'>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell width={5} className='table_media'>
                            <MediaPlayer
                                player={this.getPlayer}
                                source={source} type='video/mp4' />
                        </Table.Cell>
                        <Table.Cell width={1} className='table_ctls'>
                            <TrimmerControls
                                player={player} />
                        </Table.Cell>
                        <Table.Cell width={3} className='table_inouts'>
                            <Button.Group attached='top' size='mini'>
                                <Button onClick={this.setIopState}>Save</Button>
                                <Button onClick={this.getIopState}>Restore</Button>
                            </Button.Group>
                            <Segment attached raised textAlign='center' className='inout_content'>
                                <InoutControls onRef={ref => (this.InoutControls = ref)}
                                    onSetPoints={this.getInouts}
                                    player={player}
                                    inpoints={trim_meta.inpoints}
                                    outpoints={trim_meta.outpoints} />
                            </Segment>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <Segment color='blue' textAlign='center' raised >
                                <b>{trim_meta.file_name}</b>
                            </Segment>
                        </Table.Cell>
                        <Table.Cell>
                            {
                                mode === "ktaim" ?
                                <Checkbox label='Ktaim' checked disabled />
                                :
                                <Checkbox label='LeloMikud' onClick={this.toggleLelomikud} checked={lelomikud} />
                            }
                        </Table.Cell>
                        <Table.Cell textAlign='center'>
                            <Button size='big' color='red'
                                    disabled={!ioValid}
                                    loading={loading}
                                    onClick={this.postTrimMeta}>Trim
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        );
    }
}