import React, { Component, Fragment } from 'react';
import { Button, Label } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';
import { toHms } from '../shared/tools';

export default class InoutControls extends Component {

    state = {
        inpoints: [null],
        outpoints: [null],
    };

    setIn = (i) => {
        let currentTime = Number(this.props.player.getCurrentTime().toFixed(2));
        //console.log(":: HMS: ",toHms(currentTime) + ":: SEC: ",currentTime + ":: Index: ",i);
        let inpoints = this.state.inpoints;
        inpoints[i] = currentTime;
        this.setState({inpoints: inpoints});
    };

    setOut = (i) => {
        let currentTime = Number(this.props.player.getCurrentTime().toFixed(2));
        let inpoints = this.state.inpoints;
        let outpoints = this.state.outpoints;
        //console.log(":: In: ",inpoints[i] + "-- Out: ",currentTime + "-- Index: ",i);
        outpoints[i] = currentTime;
        this.setState({outpoints: outpoints});
        this.props.onSetPoints(inpoints, outpoints);
        if(i === (outpoints.length - 1) && inpoints[i] !== null) {
            inpoints.push(null);
            outpoints.push(null);
            this.setState({inpoints: inpoints, outpoints: outpoints});
        }
    };

    jumpPoint = (point, i) => {
        this.props.player.setCurrentTime(point);
    };

    render() {
        let inout = this.state.inpoints.map((inp, i) => {
            let outp = this.state.outpoints[i];
            return (
                <Fragment>
                    <Button as='div' labelPosition='right'>
                        <Button icon onClick={() => this.setIn(i)} color='grey' />
                        <Label as='a' basic pointing='left' color={inp > outp ? "red" : ""} onDoubleClick={() => this.jumpPoint(inp ,i)}>{inp !== null ? toHms(inp) : "<- Set in"}</Label>
                    </Button>
                    <Button as='div' labelPosition='left'>
                        <Label as='a' basic pointing='right' color={inp > outp ? "red" : ""} onDoubleClick={() => this.jumpPoint(outp, i)}>{outp !== null ? toHms(outp) : "Set out ->"}</Label>
                        <Button icon onClick={() => this.setOut(i)} color='grey' />
                    </Button>
                </Fragment>
            );
        });

        return (
            <Fragment >
                {inout}
            </Fragment>
        );
    }
}