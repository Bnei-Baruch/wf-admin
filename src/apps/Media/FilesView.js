import React, {Component} from 'react';
import {getData, getUnits, putData, MDB_FINDSHA, MDB_UNIT_URL, toHms, WFSRV_BACKEND,
    mdbUpload, findMdbFile, newMediaUnit, insertFile} from '../../shared/tools';
import {
    Segment,
    Icon,
    Table,
    Loader,
    Input,
    Button,
    Menu,
    Modal,
    Message,
    Popup,
    List,
    Grid,
    Select,
    Checkbox,
    Form,
    TextArea
} from 'semantic-ui-react'
import DatePicker from "react-datepicker";
import MediaPlayer from "../../components/Media/MediaPlayer";
import MediaUpload from "./MediaUpload";


class FilesView extends Component {

    state = {
        file_data: {},
        files: [],
        filters: {},
        page: 0,
        source: "",
        date: null,
        uid: "",
        label_id: "",
        active: null,
        // Upload metadata modal (separate from the table filters above)
        modal_open: false,
        upload_data: null,
        modal_label_id: "",
        cassette: true,
        description: "",
        labels: [],
        selected_label: null,
        label_loading: false,
        label_query: "",
        label_checking: false,
        saving: false,
    };

    componentWillUnmount() {
        clearTimeout(this.searchTimer);
    };

    componentDidMount() {
        this.getFiles();
    };

    getFiles = (offset) => {
        const {filters, page} = this.state;
        offset = offset < 0 ? 0 : offset !== undefined ? offset : page;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? `media/kv?limit=20&offset=${offset}` : `media/kv?limit=20&offset=${offset}&` + query.join('&');

        getData(path, files => {
            console.log(files)
            this.setState({page: offset, files: files || []})
        });
    };

    selectFile = (file_data) => {
        console.log(":: Selected file: ",file_data);
        let path = file_data.file_path;
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({source, active: file_data.media_id, file_data});
    };

    setDateFilter = (date) => {
        if(!date) {
            this.removeFilter("date");
            return
        }
        const {filters} = this.state;
        filters.date = date.toLocaleDateString('sv');
        this.setState({filters, date, page: 0}, () => {
            this.getFiles();
        });
    };

    setUnitFilter = (uid) => {
        if(!uid) {
            this.removeFilter("uid");
            return
        }
        const {filters} = this.state;
        filters.uid = uid;
        this.setState({filters, uid, page: 0}, () => {
            this.getFiles();
        });
    };

    setLabelFilter = (label_id) => {
        if(!label_id) {
            this.removeFilter("label_id");
            return
        }
        const {filters} = this.state;
        filters.label_id = label_id;
        this.setState({filters, label_id, page: 0}, () => {
            this.getFiles();
        });
    };

    removeFilter = (f) => {
        const {filters} = this.state;
        delete filters[f];
        const value = f === "date" ? null : "";
        this.setState({filters, [f]: value, page: 0}, () => {
            this.getFiles();
        });
    };

    getPlayer = (player) => {
        console.log(":: Media - got player: ", player);
    };

    // Render the full label object (extra.label) as a key/value list for the hover popup
    labelContent = (label) => {
        return (
            <List size='small'>
                {Object.keys(label).map((k) => (
                    <List.Item key={k}>
                        <List.Content>
                            <b>{k}:</b> {String(label[k])}
                        </List.Content>
                    </List.Item>
                ))}
            </List>
        );
    };

    mediaWorkflow = (file_data) => {
        console.log(":: Upload file: ", file_data)
        // Check SHA1 in WFDB
        getData(`media/kv?sha1=${file_data.sha1}`, (trimmer) => {
            if(trimmer.length > 0) {
                console.log(":: Found data in media DB by SHA1: ",trimmer);
                alert("File already exist in Workflow DB!");
            } else {
                // Check SHA1 in MDB
                let sha1 = file_data.sha1;
                let fetch_url = `${MDB_FINDSHA}/${sha1}`;
                getUnits(fetch_url, (units) => {
                    if (units.total > 0) {
                        console.log("The file exist in MDB!", units);
                        alert("File already exist in MDB!");
                    } else {
                        // File passed all checks and does not exist yet - ask for metadata
                        console.log(":: MediaApp - new file, open modal: ", file_data);
                        this.setState({upload_data: file_data, modal_open: true, modal_label_id: "", cassette: true,
                            description: "", selected_label: null, labels: [], label_query: ""});
                    }
                });
            }
        });
    };

    // Lookup label by cassette id. The id column is an integer, so this is an exact
    // match (labels/kv?id=) - non numeric input is ignored, it would break the query.
    searchLabels = (e, {searchQuery}) => {
        this.setState({label_query: searchQuery});
        clearTimeout(this.searchTimer);
        const query = (searchQuery || "").trim();
        if(!/^\d+$/.test(query)) {
            this.setState({labels: [], label_loading: false});
            return;
        }
        this.setState({label_loading: true});
        this.searchTimer = setTimeout(() => {
            getData(`labels/kv?id=${query}`, (labels) => {
                console.log(":: Got labels: ", labels);
                this.setState({labels: labels || [], label_loading: false});
            });
        }, 400);
    };

    labelOption = (data) => {
        const {id, date, comments, lecturer} = data;
        let text = [id, date, comments || lecturer].filter(Boolean).join(" — ");
        return ({key: id, value: id, text});
    };

    closeModal = () => {
        clearTimeout(this.searchTimer);
        this.setState({modal_open: false, upload_data: null, modal_label_id: "", cassette: false,
            description: "", selected_label: null, labels: [], label_query: "", label_loading: false,
            saving: false});
    };

    selectLabel = (value) => {
        const selected = this.state.labels.find(d => d.id === value) || null;
        this.setState({modal_label_id: value, selected_label: selected});
        if(!value) return;

        // This cassette may have been digitized before - warn the operator and let him decide
        this.setState({label_checking: true});
        getData(`media/kv?label_id=${value}`, (media) => {
            this.setState({label_checking: false});
            if(media && media.length > 0) {
                console.log(":: MediaApp - label already used: ", media);
                const names = media.map(d => d.file_name).join("\n");
                const ok = window.confirm(
                    `Label ${value} is already used by ${media.length} file(s):\n\n${names}\n\nContinue anyway?`);
                if(!ok) this.setState({modal_label_id: "", selected_label: null});
            }
        });
    };

    // The file passed all checks (not in WFDB, not in MDB), so before handing it over
    // to the workflow we archive it in MDB:
    //   1. register the file     - POST operations/upload
    //   2. resolve its id/uid    - GET rest/files/?sha1=  (upload responds with status only)
    //   3. create TAPE unit   - POST rest/content_units/
    //   4. link file to the unit - PUT rest/files/:id/
    // Resulting ids go to extra, unit_uid is duplicated into the root uid.
    applyMedia = async () => {
        let {upload_data: file_data, modal_label_id, cassette, selected_label, description} = this.state;
        file_data.label_id = modal_label_id;
        file_data.label = selected_label;
        file_data.description = description;
        file_data.wfstatus = {...(file_data.wfstatus || {}), cassette};

        this.setState({saving: true});

        try {
            await mdbUpload(file_data, this.props.user, selected_label);

            const mdb_file = await findMdbFile(file_data.sha1);
            if(!mdb_file) throw new Error("File not found in MDB after upload");

            const unit = await newMediaUnit(file_data, selected_label, description);
            await insertFile(mdb_file.id, unit.id);

            file_data.extra = {...(file_data.extra || {}),
                file_id: mdb_file.id, file_uid: mdb_file.uid,
                unit_id: unit.id, unit_uid: unit.uid};
            file_data.uid = unit.uid;
        } catch (err) {
            console.error(":: MediaApp - MDB error: ", err);
            alert(`MDB error: ${err.message}`);
            this.setState({saving: false});
            return;
        }

        console.log(":: MediaApp - apply media: ", file_data);
        putData(`${WFSRV_BACKEND}/workflow/media`, file_data, (cb) => {
            console.log(":: MediaApp - workflow respond: ",cb);
            this.getFiles();
        });
        this.closeModal();
    };

    render() {
        const {files, source, page, date, uid, label_id} = this.state;
        const {modal_open, modal_label_id, cassette, description, labels, selected_label,
            label_loading, label_query, label_checking, saving} = this.state;

        let label_options = labels.map(this.labelOption);
        // keep the currently selected label visible even after the search results change
        if(selected_label && !labels.find(d => d.id === selected_label.id)) {
            label_options = [this.labelOption(selected_label), ...label_options];
        }

        let l = (<Loader size='mini' active inline />);

        let files_data = files.map((data) => {
            const {media_id, file_name, label_id, extra, uid, wfstatus} = data;
            let duration = toHms(extra.format.duration)
            let name = wfstatus?.removed ? <div>{l}&nbsp;&nbsp;&nbsp;{file_name}</div> : file_name;
            let href = `${MDB_UNIT_URL}/${extra.unit_id}`;
            let link = (<a target="_blank" rel="noopener noreferrer" href={href}>{uid}</a>);
            let time = data.date || "";
            let notes = extra?.notes || "";
            let label = extra?.label;
            let label_cell = label ? (
                <Popup
                    on='hover'
                    hoverable
                    mountNode={document.getElementById("ltr-modal-mount")}
                    trigger={<span>{label_id}</span>}
                    content={this.labelContent(label)} />
            ) : label_id;
            let active = this.state.active === media_id ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={media_id} positive={wfstatus?.kmedia} className={active}
                           onClick={() => this.selectFile(data)}>
                    <Table.Cell>{duration}</Table.Cell>
                    <Table.Cell onClick={(e) => e.stopPropagation()}>{label_cell}</Table.Cell>
                    <Table.Cell>{link}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{notes}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment basic className="wfdb_app">
                <MediaUpload onFileData={this.mediaWorkflow}/>
                <Modal closeOnDimmerClick={false}
                       onClose={this.closeModal}
                       open={modal_open}
                       size='tiny'
                       closeIcon="close">
                    <Modal.Header>Dgima</Modal.Header>
                    <Modal.Content>
                        <Grid columns='equal'>
                            <Grid.Column>
                                <Select
                                    fluid
                                    selection
                                    clearable
                                    search={(options) => options}
                                    minCharacters={1}
                                    loading={label_loading}
                                    options={label_options}
                                    placeholder='Cassette id...'
                                    value={modal_label_id}
                                    onSearchChange={this.searchLabels}
                                    onChange={(e, {value}) => this.selectLabel(value)}
                                    noResultsMessage={!/^\d+$/.test(label_query.trim()) ? 'Enter cassette id…' : (label_loading ? 'Searching…' : 'No labels found')}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Segment size='mini' basic>
                                    <Checkbox label='Cassette' checked={cassette}
                                              onChange={() => this.setState({cassette: !cassette})} />
                                </Segment>
                            </Grid.Column>
                        </Grid>
                        <Form>
                            <Form.Field>
                                <label>Description</label>
                                <TextArea
                                    placeholder='Notes...'
                                    value={description}
                                    onChange={(e, {value}) => this.setState({description: value})}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.closeModal} disabled={saving}>Cancel</Button>
                        <Button positive loading={saving || label_checking} disabled={!modal_label_id || saving || label_checking} onClick={this.applyMedia}>Apply</Button>
                    </Modal.Actions>
                </Modal>
                <Message size='large'>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <Modal trigger={<Button color='brown' icon='play' disabled={!source}/>}
                                   size='tiny'
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={source} type='video/mp4'/>
                            </Modal>
                        </Menu.Item>
                        <Menu.Item>
                            <DatePicker
                                customInput={<Input icon={
                                    <Icon name={date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("date")} />
                                }/>}
                                dateFormat="yyyy-MM-dd"
                                showYearDropdown
                                showMonthDropdown
                                scrollableYearDropdown
                                maxDate={new Date()}
                                openToDate={new Date()}
                                selected={date ? date : null}
                                placeholderText="Date:"
                                onChange={this.setDateFilter}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <Input
                                placeholder="UID:"
                                value={uid}
                                icon={<Icon name={uid ? 'close' : 'search'} link onClick={() => uid && this.removeFilter("uid")} />}
                                onChange={(e, {value}) => this.setUnitFilter(value)} />
                        </Menu.Item>
                        <Menu.Item>
                            <Input
                                placeholder="Label ID:"
                                value={label_id}
                                icon={<Icon name={label_id ? 'close' : 'search'} link onClick={() => label_id && this.removeFilter("label_id")} />}
                                onChange={(e, {value}) => this.setLabelFilter(value)} />
                        </Menu.Item>
                        <Menu.Menu position='right'>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>Duration</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Label ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>UID</Table.HeaderCell>
                            <Table.HeaderCell width={3}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Date</Table.HeaderCell>
                            <Table.HeaderCell width={5}>Notes</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {files_data}
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='6' textAlign='center'>
                                <Button.Group>
                                    <Button basic disabled={page === 0}
                                            onClick={() => this.getFiles(page - 20)}>
                                        <Icon name='left chevron' />
                                    </Button>
                                    <Button basic>{page}-{page + files.length}</Button>
                                    <Button basic disabled={files.length < 20}
                                            onClick={() => this.getFiles(page + 20)}>
                                        <Icon name='right chevron' />
                                    </Button>
                                </Button.Group>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment>
        );
    }
}

export default FilesView;
