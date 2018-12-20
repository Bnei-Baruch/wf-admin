import React, {Component, Fragment} from 'react'
import { getData } from '../../shared/tools';
import { Table } from 'semantic-ui-react'

class WFDBLabels extends Component {

    state = {
        capture: [],
    };

    componentDidMount() {
        this.getIngestData("date", this.props.date);
    };

    componentDidUpdate(prevProps) {
        let prev = [prevProps.date, prevProps.skey, prevProps.svalue];
        let next = [this.props.date, this.props.skey, this.props.svalue];
        if (JSON.stringify(prev) !== JSON.stringify(next))
            this.getIngestData(this.props.skey, this.props.svalue);
    };

    getIngestData = (skey, svalue) => {
        let search = this.props.skey === "date" && !svalue ? this.props.date : svalue;
        if(!search) return;
        if(skey === "id") {
            getData(`label/${svalue}`, (capture) => { this.setState({capture: [capture]}) });
        } else {
            getData(`labels/find?key=${skey}&value=${search}`, (capture) => { this.setState({capture}) });
        }
    };

    render() {
        let capture_data = this.state.capture.map((data) => {
            const {archive_place,bar_code,cassete_type,comments,content_type,date,duration,language,id,lecturer,location,mof,subject} = data;
            return (
                <Table.Row key={id} className="monitor_tr">
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{date}</Table.Cell>
                    <Table.Cell>{comments}</Table.Cell>
                    <Table.Cell>{content_type}</Table.Cell>
                    <Table.Cell>{language}</Table.Cell>
                    <Table.Cell>{lecturer}</Table.Cell>
                    <Table.Cell>{duration}</Table.Cell>
                    <Table.Cell>{location}</Table.Cell>
                    <Table.Cell>{mof}</Table.Cell>
                    {/*<Table.Cell>{subject}</Table.Cell>*/}
                    <Table.Cell>{cassete_type}</Table.Cell>
                    <Table.Cell>{archive_place}</Table.Cell>
                    <Table.Cell>{bar_code}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Fragment>
                <Table compact='very' selectable fixed basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Date</Table.HeaderCell>
                            <Table.HeaderCell width={5}>Comments</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Content</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Lang</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Lecturer</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Duration</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Location</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Mof</Table.HeaderCell>
                            {/*<Table.HeaderCell width={1}>Subj</Table.HeaderCell>*/}
                            <Table.HeaderCell width={1}>CT</Table.HeaderCell>
                            <Table.HeaderCell width={1}>AP</Table.HeaderCell>
                            <Table.HeaderCell width={2}>BC</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {capture_data}
                    </Table.Body>
                </Table>
            </Fragment>
        );
    }
}

export default WFDBLabels;