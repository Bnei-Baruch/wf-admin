import React, { Component } from 'react';
import { Container, Message,Image } from 'semantic-ui-react';
import logo from '../../components/KL_Tree_128.png';

class BoardJob extends Component {

    state = {
        disabled: true,
        loading: true,
    };

    render() {

        return (
            <Container textAlign='center' >
                <Message size='massive'>
                    <Message.Header>Video Department</Message.Header>
                    <br/>
                    <Image src={logo} centered />
                </Message>
            </Container>
        );
    }
}

export default BoardJob;
