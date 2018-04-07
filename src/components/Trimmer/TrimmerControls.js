import React, { Component, Fragment } from 'react';
import { Segment, Button } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

export default class TrimmerControls extends Component {

    setTime = (count, dir) => {
        //this.props.player.play();
        let currentTime = this.props.player.getCurrentTime();
        if(dir === "+") {
            this.props.player.setCurrentTime(currentTime + count);
        } else {
            this.props.player.setCurrentTime(currentTime - count);
        }
    };

    render() {

        return (
            <Fragment >
                <Segment raised textAlign='center' className="trimmer_control">
                    Speed
                    <Button.Group size='mini' >
                        <Button className="btn_speed" />
                        <Button.Or text='<' />
                        <Button>1</Button>
                        <Button.Or text='>'/>
                        <Button className="btn_speed" />
                    </Button.Group><br />
                </Segment>
                <Segment raised textAlign='center' className="trimmer_control">
                    Time
                    <Button.Group size='mini' >
                        <Button onClick={() => this.setTime(300)}>-</Button>
                        <Button.Or text='5m' />
                        <Button onClick={() => this.setTime(300, '+')}>+</Button>
                    </Button.Group><br />
                    <Button.Group size='mini'>
                        <Button onClick={() => this.setTime(120)}>-</Button>
                        <Button.Or text='2m' />
                        <Button onClick={() => this.setTime(120, '+')}>+</Button>
                    </Button.Group>
                    <Button.Group size='mini'>
                        <Button onClick={() => this.setTime(60)}>-</Button>
                        <Button.Or text='1m' />
                        <Button onClick={() => this.setTime(60, '+')}>+</Button>
                    </Button.Group>
                    <Button.Group size='mini'>
                        <Button onClick={() => this.setTime(10)}>-</Button>
                        <Button.Or text='10s' />
                        <Button onClick={() => this.setTime(10, '+')}>+</Button>
                    </Button.Group>
                    <Button.Group size='mini'>
                        <Button onClick={() => this.setTime(1)}>-</Button>
                        <Button.Or text='1s' />
                        <Button onClick={() => this.setTime(1,'+')}>+</Button>
                    </Button.Group>
                </Segment>
                <Segment raised textAlign='center' className="trimmer_control">
                    Frames
                    <Button.Group size='mini' >
                        <Button>-</Button>
                        <Button.Or text='1' />
                        <Button>+</Button>
                    </Button.Group><br />
                    <Button.Group size='mini'>
                        <Button>-</Button>
                        <Button.Or text='5' />
                        <Button>+</Button>
                    </Button.Group>
                    <Button.Group size='mini'>
                        <Button>-</Button>
                        <Button.Or text='12' />
                        <Button>+</Button>
                    </Button.Group>
                </Segment>
            </Fragment>
        );
    }
}