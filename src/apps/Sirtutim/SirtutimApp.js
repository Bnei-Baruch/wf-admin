import React, {Component} from 'react'
import {Image,Segment,Table,Button,Card} from "semantic-ui-react";
import {getData, SIRTUT_URL, WFRP_BACKEND} from "../../shared/tools";
//import moment from 'moment';
//import {WFSRV_BACKEND, putData, WFRP_STATE, getData} from "../../shared/tools";

class SirtutimApp extends Component {

    state = {
        captured: [1,2,3],
        src: `${SIRTUT_URL}`,
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

    captureSirtut = () => {
        this.scrollToBottom();
    };

    removeAll = () => {
        console.log("remove all sirtutim");
        if(window.confirm(`Are you sure?`)) {
            this.setState({captured: []});
        }
    };

    uploadSirtut = () => {
        console.log("upload sirut");
    };

    removeSirtut = () => {
        console.log("remove sirut");
    };

    scrollToBottom = () => {
        this.refs.end.scrollIntoView({ behavior: 'smooth' })
    };

    render() {
        const {src,captured} = this.state;

        let sirtutim_list = captured.map(sirtut => {
            return (
                <Card key={sirtut} >
                    <Card.Content>
                        <Image fluid src={`${SIRTUT_URL}`} />
                    </Card.Content>
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='green'
                                    onClick={this.uploadSirtut} >
                                Upload
                            </Button>
                            <Button basic color='red'
                                    onClick={this.removeSirtut} >
                                Remove
                            </Button>
                        </div>
                    </Card.Content>
                </Card>
            );
        });

        return (
            <Table basic='very' unstackable className='sirtut_table'>
                <Table.Row>
                    <Table.Cell textAlign='right'>
                        <Segment textAlign='center' className='sirtut_segment' raised secondary>
                            <Button attached='top' fluid color='grey' size='mini'
                                    onClick={this.removeAll} >
                                Remove ALL
                            </Button>
                            <Image fluid src={src} />
                            <Button attached='bottom' fluid color='green'
                                    onClick={this.captureSirtut} >
                                Capture
                            </Button>
                        </Segment>
                    </Table.Cell>
                    <Table.Cell textAlign='left' >
                        <Segment basic className='sirtut_captured'>
                            {sirtutim_list}
                            <div ref='end' />
                        </Segment>
                    </Table.Cell>
                </Table.Row>
            </Table>
        );
    }
}

export default SirtutimApp;