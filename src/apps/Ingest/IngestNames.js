import React, {Component} from 'react'
//import DatePicker from 'react-datepicker';
//import moment from 'moment';
import {getConv, putData, WFDB_STATE} from '../../shared/tools';
import { Input, Menu, Dropdown, Button, Modal } from 'semantic-ui-react';
import CIT from '../CIT/CIT';

class IngestNames extends Component {

    state = {
        disabled: true,
        sending: false,
        file_name: "",
        lines: {},
        line: {},
        line_id: null,
        newline: {},
        open: false,
        presets: {},
    };

    componentDidMount() {
        this.getLines()
    }

    getLines = () => {
        getConv(`names/lines`, (lines) => {
            console.log(":: Got Lines: ",lines);
            this.setState({lines});
        });
    };

    selectLine = (id,line) => {
        console.log(":: Select Line: ",line);
        this.setState({disabled: false, line, line_id: id, file_name: line.final_name});
        let preset = {id,name:line.final_name};
        this.props.onLine(preset);
    };

    openCit = () => {
        this.setState({open: true});
    };

    onCancel = (data) => {
        console.log(":: Cit cancel: ", data);
        this.setState({open: false});
    };

    newLine = (newline) => {
        console.log(":: New Line: ", newline);
        this.setState({open: false, newline });
    };

    removeLine = (line) => {
        console.log(":: Remove Line: ",line);
        //this.setState({disabled: false, lang_data: state});
    };

    setFileName = (file_name) => {
        console.log(":: File Name: ", file_name);
        this.setState({file_name});
        let preset = {id: this.state.line_id, name: file_name};
        this.props.onLine(preset);
    };

    render() {

        const {lines} = this.state;

        let options = Object.keys(lines).map((id, i) => {
            let line = lines[id];
            if(id === "l7DZ2lxv" || id === "C1JEylF7" || id === "8H3iIRzV" || id === "7G4zzMuC")
                return false;
            return (<Dropdown.Item key={i} onClick={() => this.selectLine(id,line)}>{line.final_name}</Dropdown.Item>)
        });

        return (
            <Menu secondary >
                <Menu.Item>
                    <Modal closeOnDimmerClick={false}
                           trigger={<Button positive onClick={this.openCit}>New</Button>}
                           onClose={this.onCancel} open={this.state.open} closeIcon="close"
                           mountNode={document.getElementById("cit-modal-mount")}>
                        <Modal.Content>
                            <CIT metadata={{}}
                                 onCancel={this.onCancel}
                                 onComplete={(x) => this.newLine(x)}/>
                        </Modal.Content>
                    </Modal>
                </Menu.Item>
                <Menu.Item>
                    <Dropdown item icon='tags' onClick={this.getLines}>
                        <Dropdown.Menu>
                            {options}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Input className="lines_dropdown" focus placeholder='Lines...'
                           onChange={e => this.setFileName(e.target.value)}
                           value={this.state.file_name} />
                </Menu.Item>
                <Menu.Item>
                    <Button negative
                            disabled={this.state.disabled}
                            loading={this.state.sending}
                            onClick={this.removeLine}>Remove
                    </Button>
                </Menu.Item>
            </Menu>
        );
    }
}

export default IngestNames;