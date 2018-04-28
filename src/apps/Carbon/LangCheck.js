import React, {Component} from 'react'
//import DatePicker from 'react-datepicker';
//import moment from 'moment';
import {getConv} from '../../shared/tools';
import { Menu, Segment, Dropdown, Button, Label } from 'semantic-ui-react'

class LangCheck extends Component {

    state = {
        disabled: true,
        langcheck: {},
        file_data: {},
        source: "",
    };

    getLangState = () => {
        getConv(`state/langcheck`, (langcheck) => {
            this.setState({langcheck});
        });
    };

    selectState = (state) => {
        console.log(state);
        this.props.onLangState(state);
    };

    render() {

        let langcheck_option = Object.keys(this.state.langcheck).map((id, i) => {
            let state = this.state.langcheck[id];
            let name = state.file_name;
            return ({ key: id, text: name, value: state })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Label  attached='top' className="trimmed_label">Lang Check</Label>
                <Menu secondary >
                    <Menu.Item>
                        <Dropdown
                            className="langcheck_dropdown"
                            error={this.state.disabled}
                            scrolling={false}
                            placeholder="Select File To Check:"
                            selection
                            options={langcheck_option}
                            onChange={(e,{value}) => this.selectState(value)}
                            onClick={() => this.getLangState(this.state.date)}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <Button primary disabled={this.state.disabled} onClick={this.sendToTrim}>Open</Button>
                    </Menu.Item>
                </Menu>
            </Segment>
        );
    }
}

export default LangCheck;