import React, { Component } from 'react';
import { Segment, Table, } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import MediaPlayer from "../Media/MediaPlayer";
import TrimmerControls from "./TrimmerControls";
import InoutControls from "./InoutControls";

export default class MediaTrimmer extends Component {

    state = {
        player: null
    };

    getPlayer = (player) => {
        console.log(":: Trimmer: ", player);
        this.setState({player: player});
    };

    render() {

        return (
            <Table className="table_main">
                <Table.Row>
                    <Table.Cell width={5} className="table_media">
                        <MediaPlayer player={this.getPlayer}/>
                    </Table.Cell>
                    <Table.Cell width={1} className="table_ctls">
                        <TrimmerControls player={this.state.player}/>
                    </Table.Cell>
                    <Table.Cell width={3} className="table_inouts">
                        <Segment raised textAlign='center'>
                            <InoutControls player={this.state.player}/>
                        </Segment>
                    </Table.Cell>
                </Table.Row>
            </Table>
        );
    }
}