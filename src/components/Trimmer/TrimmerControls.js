import React, { Component, Fragment } from 'react';
import { Segment, Button } from 'semantic-ui-react'

export default class TrimmerControls extends Component {

    render() {

        const player = this.props.player;

        return (
            <Fragment >
                <Segment raised textAlign='center' className="trimmer_control">
                    Speed
                    <Button.Group size='mini' >
                        <Button className="btn_speed" onClick={() => player.node.playbackRate -= .25} />
                        <Button.Or text='<' />
                        <Button onClick={() => player.node.playbackRate = 1} >1</Button>
                        <Button.Or text='>'/>
                        <Button className="btn_speed" onClick={() => player.node.playbackRate += .25} />
                    </Button.Group><br />
                </Segment>
                <Segment raised textAlign='center' className="trimmer_control">
                    Time
                    <Button.Group size='mini' >
                        <Button onClick={() => player.node.currentTime -= 300}>-</Button>
                        <Button.Or text='5m' />
                        <Button onClick={() => player.node.currentTime += 300}>+</Button>
                    </Button.Group><br />
                    <Button.Group size='mini'>
                        <Button onClick={() => player.node.currentTime -= 120}>-</Button>
                        <Button.Or text='2m' />
                        <Button onClick={() => player.node.currentTime += 120}>+</Button>
                    </Button.Group>
                    <Button.Group size='mini'>
                        <Button onClick={() => player.node.currentTime -= 60}>-</Button>
                        <Button.Or text='1m' />
                        <Button onClick={() => player.node.currentTime += 60}>+</Button>
                    </Button.Group>
                    <Button.Group size='mini'>
                        <Button onClick={() => player.node.currentTime -= 10}>-</Button>
                        <Button.Or text='10s' />
                        <Button onClick={() => player.node.currentTime += 10}>+</Button>
                    </Button.Group>
                    <Button.Group size='mini'>
                        <Button onClick={() => player.node.currentTime -= 1}>-</Button>
                        <Button.Or text='1s' />
                        <Button onClick={() => player.node.currentTime += 1}>+</Button>
                    </Button.Group>
                </Segment>
                <Segment raised textAlign='center' className="trimmer_control">
                    Frames
                    <Button.Group size='mini' >
                        <Button onClick={() => player.node.currentTime -= 1/25.0}>-</Button>
                        <Button.Or text='1' />
                        <Button onClick={() => player.node.currentTime += 1/25.0}>+</Button>
                    </Button.Group><br />
                    <Button.Group size='mini'>
                        <Button onClick={() => player.node.currentTime -= 5/25.0}>-</Button>
                        <Button.Or text='5' />
                        <Button onClick={() => player.node.currentTime += 5/25.0}>+</Button>
                    </Button.Group>
                    <Button.Group size='mini'>
                        <Button onClick={() => player.node.currentTime -= 12/25.0}>-</Button>
                        <Button.Or text='12' />
                        <Button onClick={() => player.node.currentTime += 12/25.0}>+</Button>
                    </Button.Group>
                </Segment>
            </Fragment>
        );
    }
}