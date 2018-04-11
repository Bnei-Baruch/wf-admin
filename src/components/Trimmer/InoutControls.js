import React, { Component, Fragment } from 'react';
import { Button, Label } from 'semantic-ui-react'
import { toHms } from '../shared/tools';

export default class InoutControls extends Component {


    state = {
        inpoints: [],
        outpoints: [],
    };

    componentDidMount() {
        console.log("-- InoutControls Did Mount :");
    };

    componentDidUpdate(prevProps) {
        console.log("-- InoutControls Did Update :");
        //if(this.state.inpoints.length === 0)
         //   this.setState({inpoints: this.props.inpoints, outpoints: this.props.outpoints});
    }

    setIn = (i) => {
        let currentTime = Number(this.props.player.getCurrentTime().toFixed(2));
        let inpoints = this.state.inpoints;
        let outpoints = this.state.outpoints;
        if(i === null) {
            inpoints[outpoints.length] = currentTime;
        } else {
            inpoints[i] = currentTime;
            this.props.onSetPoints(inpoints, outpoints);
        }
        this.setState({inpoints});
    };

    setOut = (i) => {
        let currentTime = Number(this.props.player.getCurrentTime().toFixed(2));
        let inpoints = this.state.inpoints;
        let outpoints = this.state.outpoints;
        if(i === null) {
            outpoints[inpoints.length - 1] = currentTime;
        } else {
            outpoints[i] = currentTime;
        }
        this.setState({outpoints});
        this.props.onSetPoints(inpoints, outpoints);
    };

    jumpPoint = (point, i) => {
        this.props.player.setCurrentTime(point);
    };

    render() {
        let inout = this.state.outpoints.map((outp, i) => {
            let inp = this.state.inpoints[i];
            return (
                <Fragment>
                    <Button as='div' labelPosition='right'>
                        <Button icon onClick={() => this.setIn(i)} color='grey' />
                        <Label as='a' basic pointing='left' color={inp > outp ? 'red' : ''} onDoubleClick={() => this.jumpPoint(inp ,i)}>{inp !== null ? toHms(inp) : "<- Set in"}</Label>
                    </Button>
                    <Button as='div' labelPosition='left'>
                        <Label as='a' basic pointing='right' color={inp > outp ? 'red' : ''} onDoubleClick={() => this.jumpPoint(outp, i)}>{outp !== null ? toHms(outp) : "Set out ->"}</Label>
                        <Button icon onClick={() => this.setOut(i)} color='grey' />
                    </Button>
                </Fragment>
            );
        });

        return (
            <Fragment >
                {inout}
                <Button as='div' labelPosition='right'>
                    <Button icon onClick={() => this.setIn(null)} color='grey' />
                    <Label as='a' basic pointing='left' >{
                        this.state.inpoints[this.state.outpoints.length] !== undefined ?
                            toHms(this.state.inpoints[this.state.outpoints.length]) : "<- Set in"}</Label>
                </Button>
                <Button as='div' labelPosition='left'>
                    <Label as='a' basic pointing='right' >{"Set out ->"}</Label>
                    <Button icon onClick={() => this.setOut(null)} color='grey' />
                </Button>
            </Fragment>
        );
    }
}