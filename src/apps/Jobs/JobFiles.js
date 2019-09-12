import React, { Component } from 'react';
import { Container,Message } from 'semantic-ui-react';

class JobFiles extends Component {

    state = {};

    componentDidMount() {
    };


    render() {

        return (
            <Container textAlign='center' >
                <Message size='massive'>
                    <Message.Header>
                        Job Files
                    </Message.Header>
                    <p>List of job files here</p>
                    <p>List of job files here</p>
                    <p>List of job files here</p>
                </Message>
            </Container>
        );
    }
}

export default JobFiles;
