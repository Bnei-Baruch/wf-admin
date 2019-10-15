import React, {Component} from 'react'
import {Image,Segment,Table,Button,Card} from "semantic-ui-react";
import {putData, SIRTUT_URL, WFSRV_BACKEND} from "../../shared/tools";
import moment from 'moment';

class SirtutimApp extends Component {

    state = {
        cap_loading: false,
        cap_disabled: false,
        captured: [],
        id: null,
        src: `${SIRTUT_URL}`,
    };

    componentDidMount() {
        let ival = setInterval(() => {
            let id = moment().format('x');
            this.setState({id})
        }, 1000 );
        this.setState({ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    captureSirtut = () => {
        let {id, captured} = this.state;
        this.setState({cap_loading: true, cap_disabled: true});
        putData(`${WFSRV_BACKEND}/workflow/sirtutim`, {id}, (cb) => {
            console.log(":: Sirtutim - workflow respond: ",cb);
            captured.push(id);
            setTimeout( () => {
                this.setState({id, captured, cap_loading: false, cap_disabled: false}, () => {
                    setTimeout( () => this.scrollToBottom(),500);
                });
            }, 1000);

        });
    };

    removeAll = () => {
        console.log("remove all sirtutim");
        if(window.confirm(`Are you sure?`)) {
            this.setState({captured: []});
        }
    };

    uploadSirtut = (sid,i) => {
        console.log("upload sirut: ",sid,i);
    };

    removeSirtut = (sid,i) => {
        console.log("remove sirut: ",sid,i);
        let {captured} = this.state;
        captured.splice(i, 1);
        this.setState({captured});
    };

    scrollToBottom = () => {
        this.refs.end.scrollIntoView({ behavior: 'smooth' })
    };

    render() {
        const {src,captured,id,cap_loading,cap_disabled} = this.state;

        let sirtutim_list = captured.map((sid,i) => {
            return (
                <Card key={sid} >
                    <Card.Content>
                        <Image fluid src={`${WFSRV_BACKEND}/backup/captured/sirtutim/tmp/${sid}.jpg`} />
                    </Card.Content>
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='green'
                                    onClick={() => this.uploadSirtut(sid,i)} >
                                Upload
                            </Button>
                            <Button basic color='red'
                                    onClick={() => this.removeSirtut(sid,i)} >
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
                            <Image fluid src={src + '?' + id} />
                            <Button attached='bottom' fluid color='green'
                                    loading={cap_loading}
                                    disabled={cap_disabled}
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