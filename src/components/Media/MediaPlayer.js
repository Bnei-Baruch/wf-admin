import React, { Component } from 'react';
import MediaElement from './MediaElement';
import 'semantic-ui-css/semantic.min.css';

export default class MediaPlayer extends Component {

    // Other code

    render() {
        const
            sources = [
                //{src: 'http://10.66.1.122/backup/trimmed/2018-04-05/mlt_o_norav_2018-04-05_lesson_achana_n2_p0_t1522922675p.mp4', type: 'video/mp4'},
                {src: 'http://10.66.1.122/backup/captured//main/2018-04-07/mlt_o_rav_2018-04-07_lesson_n6_p0_c1523061620265p.mp4', type: 'video/mp4'},
            ],

            config = {
                alwaysShowControls: true,
                autoRewind: false,
                alwaysShowHours: true,
                features : ['playpause','tracks','current','progress','duration','volume'],
                // markers: [3, 1000, 3000],
                // markerColor: '#ff122b',
                // markerWidth: 3,
            },

            tracks = {}
        ;

        return (
            <MediaElement {...this.props}
                id="player1"
                mediaType="video"
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