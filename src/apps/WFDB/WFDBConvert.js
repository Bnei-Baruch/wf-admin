import React, { Component, Fragment } from 'react'
import { getData } from '../../shared/tools';
import { Table } from 'semantic-ui-react'
import {langs_bb} from '../../shared/consts';

class WFDBConvert extends Component {

    state = {
        convert: [],
    };

    componentDidMount() {
        this.getKmediaData("date", this.props.date);
    };

    getKmediaData = (skey, svalue) => {
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`convert/find?key=${skey}&value=${search}`, (convert) => {
            console.log(":: Convert DB Data: ",convert);
            this.setState({convert});
        });
    };

    searchData = (tab) => {
        const {skey,svalue} = this.props;
        console.log(tab);
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`convert/find?key=${skey}&value=${search}`, (convert) => {
            console.log(":: Convert DB Data: ",convert);
            this.setState({convert});
        });
    };

    render() {
        const {convert} = this.state;
        const languages = langs_bb;

        let convert_data = convert.map((data, i) => {
                let langs = languages.map((lang) => {
                    let ex = data.langcheck ? data.langcheck.languages[lang] : false;
                    return (
                        <Table.Cell colSpan={2} key={lang} disabled positive={ex} >{lang}</Table.Cell>
                    )
                });
                return (
                    <Fragment key={i}>
                        <Table.Row className="monitor_tr" >
                            <Table.Cell width={1} colSpan={languages.length} >{data.name}</Table.Cell>
                            <Table.Cell width={7} colSpan={languages.length} >{data.timestamp}</Table.Cell>
                        </Table.Row>
                        <Table.Row>{langs}</Table.Row>
                    </Fragment>
                );
        });

        return (
            <Fragment>
                <Table compact='very' selectable basic size='small' fixed>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell colSpan={languages.length}>File Name</Table.HeaderCell>
                            <Table.HeaderCell colSpan={languages.length}>Time</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {convert_data}
                    </Table.Body>
                </Table>
            </Fragment>
        );
    }
}

export default WFDBConvert;