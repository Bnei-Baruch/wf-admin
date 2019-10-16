import React, {Component} from 'react'
import {Image,Segment,Table,Button,Card} from "semantic-ui-react";
import {putData, SIRTUT_URL, WFSRV_BACKEND} from "../../shared/tools";
import moment from 'moment';

class SirtutimApp extends Component {

    state = {
        capl: false,
        capd: false,
        upl: false,
        upd: false,
        reml: false,
        remd: false,
        captured: [],
        uploaded: [],
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
        this.setState({capl: true, capd: true});
        let data = {id, req: "capture"};
        putData(`${WFSRV_BACKEND}/workflow/sirtutim`, data, (cb) => {
            captured.push(id);
            setTimeout( () => {
                this.setState({id, captured, capl: false, capd: false}, () => {
                    setTimeout( () => this.scrollToBottom(),500);
                });
            }, 1000);

        });
    };

    removeAll = () => {
        if(window.confirm(`Are you sure?`)) {
            let {id} = this.state;
            this.setState({reml: true, remd: true});
            let data = {id, req: "remove"};
            putData(`${WFSRV_BACKEND}/workflow/sirtutim`, data, (cb) => {
                setTimeout( () => {
                    this.setState({captured: [], reml: false, remd: false});
                }, 1000);
            });
        }
    };

    uploadSirtut = (sid,i) => {
        let {uploaded} = this.state;
        this.setState({upl: true, upd: true});
        let data = {id: sid, req: "upload"};
        putData(`${WFSRV_BACKEND}/workflow/sirtutim`, data, (cb) => {
            uploaded.push(sid);
            setTimeout( () => {
                this.setState({uploaded, upl: false, upd: false});
            }, 1000);

        });
    };

    removeSirtut = (sid,i) => {
        let {captured} = this.state;
        captured.splice(i, 1);
        this.setState({captured});
    };

    scrollToBottom = () => {
        this.refs.end.scrollIntoView({ behavior: 'smooth' })
    };

    render() {
        const {src,captured,uploaded,id,capl,capd,reml,remd,upl,upd} = this.state;

        let sirtutim_list = captured.map((sid,i) => {
            let up = uploaded.filter(u => u === sid).length > 0;
            return (
                <Card key={sid} >
                    <Card.Content>
                        <Image fluid src={`${WFSRV_BACKEND}/backup/captured/sirtutim/tmp/${sid}.jpg`} />
                    </Card.Content>
                    <Card.Content extra>
                        <div className='ui two buttons'>
                            <Button basic color='green'
                                    loading={upl}
                                    disabled={up || upd}
                                    onClick={() => this.uploadSirtut(sid,i)} >
                                {up ? "V" : "Upload"}
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
                                    loading={reml}
                                    disabled={remd}
                                    onClick={this.removeAll} >
                                Remove ALL
                            </Button>
                            <Image fluid src={src + '?' + id} />
                            <Button attached='bottom' fluid color='green'
                                    loading={capl}
                                    disabled={capd}
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