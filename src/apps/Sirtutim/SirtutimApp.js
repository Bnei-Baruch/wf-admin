import React, {Component} from 'react'
import {Image,Segment,Table,Button,Card} from "semantic-ui-react";
import {getData, SIRTUT_URL, WFRP_BACKEND} from "../../shared/tools";
//import moment from 'moment';
//import {WFSRV_BACKEND, putData, WFRP_STATE, getData} from "../../shared/tools";

class SirtutimApp extends Component {

    state = {
        src: `${SIRTUT_URL}`
    };

    componentDidMount() {
        setInterval(() =>
            fetch(`${SIRTUT_URL}`)
                .then((response) => {
                    if (response.ok) {
                        this.setState({src: `${SIRTUT_URL}`})
                    }
                })
                .catch(ex => console.log(`get Image`, ex))
        , 1000 );
    };

    render() {
        const {src} = this.state;
        return (
            <Segment textAlign='center' raised secondary>
                <Table basic='very' fixed unstackable>
                    <Table.Row>
                        <Table.Cell>
                            <Button attached='top' fluid color='grey' size='mini'>
                                Remove ALL
                            </Button>
                            <Image fluid src={src} />
                            <Button attached='bottom' fluid color='green'>
                                Capture
                            </Button>
                        </Table.Cell>
                        <Table.Cell>
                            <Card>
                                <Card.Content>
                                    <Image fluid src={`${SIRTUT_URL}`} />
                                </Card.Content>
                                <Card.Content extra>
                                    <div className='ui two buttons'>
                                        <Button basic color='green'>
                                            Upload
                                        </Button>
                                        <Button basic color='red'>
                                            Remove
                                        </Button>
                                    </div>
                                </Card.Content>
                            </Card>
                            <Card>
                                <Card.Content>
                                    <Image fluid src={`${SIRTUT_URL}`} />
                                </Card.Content>
                                <Card.Content extra>
                                    <div className='ui two buttons'>
                                        <Button basic color='green'>
                                            Upload
                                        </Button>
                                        <Button basic color='red'>
                                            Remove
                                        </Button>
                                    </div>
                                </Card.Content>
                            </Card>
                        </Table.Cell>
                    </Table.Row>
                </Table>
            </Segment>
        );
    }
}

export default SirtutimApp;