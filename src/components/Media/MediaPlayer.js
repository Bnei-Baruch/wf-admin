import React, { Component } from 'react';
import MediaElement from './MediaElement';
import {getToken} from "../../shared/tools";

export default class MediaPlayer extends Component {

    render() {
        const
            sources = [
                {src: this.props.source + '?token=' + getToken(), type: this.props.type},
            ],

            config = {
                alwaysShowControls: true,
                autoRewind: false,
                alwaysShowHours: true,
                showTimecodeFrameCount: false,
                useSmoothHover: false,
                features : ['playpause','tracks','current','progress','duration','volume'],
            },

            tracks = {}
        ;

        return (
            <MediaElement {...this.props}
                id="player1"
                mediaType={this.props.type === 'video/mp4' ? 'video' : 'audio'}
                preload="true"
                controls
                width="640"
                height="360"
                poster=""
                sources={JSON.stringify(sources)}
                options={JSON.stringify(config)}
                tracks={JSON.stringify(tracks)}
            />
        );
    }
}