import React, { Component, Fragment } from 'react';
import { Button, Label } from 'semantic-ui-react'
import { toHms } from '../shared/tools';

export default class InoutControls extends Component {


    state = {
        inpoints: [],
        outpoints: [],
    };

    setIn = (i) => {
        const {inpoints,outpoints} = this.state;
        let currentTime = Number(this.props.player.getCurrentTime().toFixed(2));
        if(i === null) {
            inpoints[outpoints.length] = currentTime;
        } else {
            inpoints[i] = currentTime;
            this.props.onSetPoints(inpoints, outpoints);
        }
        console.log(":: Set IN: ",currentTime);
        this.setState({inpoints});
    };

    setOut = (i) => {
        const {inpoints,outpoints} = this.state;
        let currentTime = Number(this.props.player.getCurrentTime().toFixed(2));
        if(i === null) {
            outpoints[inpoints.length - 1] = currentTime;
        } else {
            outpoints[i] = currentTime;
        }
        console.log(":: Set OUT: ",currentTime);
        this.setState({outpoints});
        this.props.onSetPoints(inpoints, outpoints);
    };

    jumpPoint = (point) => {
        point ? this.props.player.setCurrentTime(point) :
            this.props.player.setCurrentTime(this.state.inpoints[this.state.inpoints.length - 1]);
    };

    render() {
        const {inpoints,outpoints} = this.state;
        let inout = outpoints.map((outp, i) => {
            let inp = inpoints[i];
            return (
                <Fragment key={i}>
                    <Button as='div' labelPosition='right'>
                        <Button icon color='grey' className="inout_btn"
                                onClick={() => this.setIn(i)}/>
                        <Label as='a' basic pointing='left' color={inp > outp ? 'red' : ''}
                               onDoubleClick={() => this.jumpPoint(inp)}>
                            {inp !== null ? toHms(inp) : "<- Set in"}
                        </Label>
                    </Button>
                    <Button as='div' labelPosition='left' className="inout_btn">
                        <Label as='a' basic pointing='right' color={inp > outp ? 'red' : ''}
                               onDoubleClick={() => this.jumpPoint(outp)}>
                            {outp !== null ? toHms(outp) : "Set out ->"}
                        </Label>
                        <Button icon color='grey' className="inout_btn"
                                onClick={() => this.setOut(i)}/>
                    </Button>
                </Fragment>
            );
        });

        return (
            <Fragment >
                {inout}
                <Button as='div' labelPosition='right' className="inout_btn">
                    <Button icon color='grey' className="inout_btn" onClick={() => this.setIn(null)} />
                    <Label as='a' basic pointing='left' onDoubleClick={() => this.jumpPoint(null)}>
                        {inpoints[outpoints.length] !== undefined ? toHms(inpoints[outpoints.length]) : "<- Set in" }
                    </Label>
                </Button>
                <Button as='div' labelPosition='left' className="inout_btn">
                    <Label as='a' basic pointing='right'>
                        {"Set out ->"}
                    </Label>
                    <Button icon color='grey' className="inout_btn" onClick={() => this.setOut(null)} />
                </Button>
            </Fragment>
        );
    }
}