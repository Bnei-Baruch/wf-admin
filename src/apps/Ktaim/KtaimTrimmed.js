import React, {Component} from 'react'

import {kmHms, getData, getUnits, IVAL, putData, WFSRV_BACKEND} from '../../shared/tools';
import {Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Message} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";

class KtaimTrimmed extends Component {

    state = {
        active: null,
        disabled: true,
        open: false,
        links: [],
        trimmed: [],
        file_data: {},
        ival: null,
        sending: false,
        renaming: false,
        tags: {},
        units: [],

    };

    componentDidMount() {
        let ival = setInterval(() => getData('trim', (data) => {
                if (JSON.stringify(this.state.trimmed) !== JSON.stringify(data))
                    this.setState({trimmed: data})
            }), IVAL );
        this.setState({ival});
        getUnits('titles.json', (tags) => {
            this.setState({tags});
        });
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    selectFile = (file_data) => {
        console.log(":: Trimmed - selected file: ",file_data);
        let path = file_data.proxy.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        let active = file_data.trim_id;
        const {wfsend,censored} = file_data.wfstatus;
        let disabled = wfsend || censored;
        this.setState({source, active, file_data, disabled});
    };

    makeLinks = (file_data) => {
        if(!file_data.wfstatus.wfsend)
            return;
        let {inpoints,outpoints} = file_data;
        let uid = file_data.line.uid;
        let links = [];
        let offset = inpoints[0];
        let ding = 5;
        for(let i=0; i<inpoints.length; i++) {
            if(i > 0) offset = offset + (inpoints[i] - outpoints[i-1] - ding);
            let inp = kmHms(inpoints[i] - offset);
            let oup = kmHms(outpoints[i] - offset);
            let url = `https://kabbalahmedia.info/lessons/cu/${uid}?sstart=${inp}&send=${oup}`;
            links.push(url);
        }
        this.setState({links})
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    openCit = () => {
        this.setState({open: true});
    };

    renameFile = () => {
        let {file_data} = this.state;
        let old_name = file_data.file_name;
        let new_name = file_data.file_name.replace(/lesson/, 'ktaim-nivcharim');
        new_name = new_name.replace(/_full/, '');
        file_data.line.manual_name = new_name;
        file_data.line.final_name = new_name;
        file_data.line.pattern = "full_lesson";
        let opath = `/backup/trimmed/${file_data.date}/${new_name}_${file_data.trim_id}o.mp4`;
        let ppath = `/backup/trimmed/${file_data.date}/${new_name}_${file_data.trim_id}p.mp4`;
        file_data.parent.file_name = old_name;
        file_data.line.title = this.state.tags[file_data.line.pattern] || "";
        file_data.original.format.filename = opath;
        file_data.proxy.format.filename = ppath;
        file_data.file_name = new_name;
        file_data.wfstatus.renamed = true;
        // Build url for preview
        let path = file_data.proxy.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        console.log(":: Old Meta: ", this.state.file_data+" :: New Meta: ",file_data);
        this.setState({open: false, disabled: true, renaming: true});
        putData(`${WFSRV_BACKEND}/workflow/rename`, file_data, (cb) => {
            console.log(":: Ingest - rename respond: ",cb);
            if(cb.status === "ok") {
                setTimeout(() => {
                        this.setState({file_data, source, renaming: false, disabled: file_data.wfstatus.wfsend}, () => {
                            this.sendFile(file_data);
                        })
                }, 2000);
            } else {
                setTimeout(() => this.setState({renaming: false, disabled: file_data.wfstatus.wfsend}), 2000);
            }
        });
    };

    onCancel = (data) => {
        console.log(":: Cit cancel: ", data);
        this.setState({open: false});
    };

    sendFile = (file_data) => {
        const {file_name, wfstatus, line} = file_data;
        console.log(":: Going to send File: ", file_data);
        this.setState({ sending: true, disabled: true });

        // In lesson part we expect rename status
        if(line.content_type === "LESSON_PART" && line.collection_type !== "CONGRESS" && !wfstatus.renamed) {
            alert("Lesson part must be renamed");
            this.setState({ sending: false });
            return
        }

        // Check if already got unit with same name
        getData(`trimmer/find?key=file_name&value=${file_name}`, (data) => {
            console.log(":: Unit check name: ",data);
            let chk = data.filter(b => b.file_name === file_name && b.wfstatus.wfsend);
            console.log(":: Unit filter: ",chk);
            if(chk.length > 0) {
                alert("Unit with this name already exist");
                this.setState({ sending: false });
            } else {
                console.log(":: Going to send :", file_data);
                putData(`${WFSRV_BACKEND}/workflow/send_ktaim`, file_data, (cb) => {
                    console.log(":: Ingest - send respond: ",cb);
                    setTimeout(() => this.setState({ sending: false }), 2000);
                    // While polling done it does not necessary
                    //this.selectFile(file_data);
                    if(cb.status !== "ok") {
                        alert("Something goes wrong!");
                    }
                });
            }
        });
    };

    render() {
        let {links} = this.state;
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let links_list = links.map((link,i) => {
            return  (<p key={i} ><i style={{color: 'blue'}}>{link}</i></p>)
        });

        let trimmed = this.state.trimmed.map((data) => {
            const {trimmed,buffer,removed,wfsend,censored,locked,secured} = data.wfstatus;
            let id = data.trim_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = new Date(id.substr(1) * 1000).toISOString().slice(11,19) || "";
            if(removed || buffer || censored)
                return false;
            let active = this.state.active === id ? 'active' : '';
            return (
                <Table.Row
                    positive={wfsend} warning={!trimmed} disabled={!trimmed || locked}
                    className={active} key={id} onClick={() => this.selectFile(data)}>
                    <Table.Cell>
                        <Modal trigger={<Icon name='linkify' color='blue' size='large'
                                             disabled={!wfsend} onClick={() => this.makeLinks(data)} />}
                               mountNode={document.getElementById("ltr-modal-mount")}
                               onClose={() => this.setState({links: []})}>
                            <Message warning attached>
                                {links_list}
                            </Message>
                        </Modal>
                    </Table.Cell>
                    <Table.Cell>{secured ? s : ""}{locked ? d : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='brown' raised >
                <Label  attached='top' className="trimmed_label">
                    {this.state.file_data.file_name ? this.state.file_data.file_name : "Trimmed"}
                </Label>
                <Message size='large'>
                <Menu size='large' secondary >
                    <Menu.Item>
                        <Modal trigger={<Button color='brown' icon='play' disabled={!this.state.source} />}
                               size='tiny'
                               mountNode={document.getElementById("ltr-modal-mount")}>
                            <MediaPlayer player={this.getPlayer} source={this.state.source} type='video/mp4' />
                        </Modal>
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button positive disabled={this.state.disabled}
                                    onClick={this.renameFile} loading={this.state.sending}>Send
                            </Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                </Message>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>Links</Table.HeaderCell>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            {/*<Table.HeaderCell width={1}>Rename</Table.HeaderCell>*/}
                            {/*<Table.HeaderCell width={1}>BUF</Table.HeaderCell>*/}
                            <Table.HeaderCell width={1}>Send</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {trimmed}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default KtaimTrimmed;
