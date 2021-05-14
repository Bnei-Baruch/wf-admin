import React, {Component} from 'react'
import FileViewer from 'react-file-viewer';
import moment from 'moment';
import {
    getData,
    putData,
    removeData,
    getUnits,
    IVAL,
    WFDB_BACKEND,
    WFSRV_BACKEND,
    getDCT,
    insertName,
    arichaName,
    MDB_FINDSHA, newProductMeta, postData, getToken
} from '../../shared/tools';
import {
    Menu,
    Segment,
    Label,
    Icon,
    Table,
    Loader,
    Button,
    Modal,
    Select,
    Message,
    Dropdown,
    Popup,
    TextArea,
    Input
} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import InsertModal from "../Insert/InsertModal"
import CIT from '../CIT/CIT';
import ProductFiles from "./ProductFiles";

class ProductsAdmin extends Component {

    state = {
        active: null,
        cit_open: false,
        doers: [],
        insert_open: false,
        insert_button: true,
        inserting: false,
        product_name: "",
        products: [],
        product_data: {},
        filedata: {},
        kmedia_option: false,
        language: "heb",
        original_language: "heb",
        metadata: {},
        input_id: "",
        ival: null,
        renaming: false,
        rename_button: false,
        send_button: true,
        sending: false,
        special: "censored",
        source: null,
        note_area: "",

    };

    componentDidMount() {
        let ival = setInterval(() => getData('products', (data) => {
                if (JSON.stringify(this.state.products) !== JSON.stringify(data))
                    this.setState({products: data})
            }), IVAL );
        this.setState({ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    selectProduct = (product_data) => {
        console.log(":: ProductsAdmin - selected product: ", product_data);

        // Check if master file is added
        if(!product_data.original) {
            this.setState({product_data, source: null, active: product_data.product_id});
            return
        } else {
            // Build url for preview (take proxy if exist)
            let path = product_data.proxy ? product_data.proxy.format.filename : product_data.original.format.filename;
            let source = `${WFSRV_BACKEND}${path}`;
            this.setState({product_data, source, active: product_data.product_id});
        }
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    renameFile = (newline) => {
        console.log(":: Cit callback: ", newline);
        let {product_data} = this.state;
        product_data.line = newline;
        let newfile_name = newline.final_name;
        let oldfile_name = product_data.file_name;
        if(product_data.original) {
            let path = product_data.original.format.filename.split('/').slice(0,-1).join('/');
            let opath = `${path}/${newfile_name}_${product_data.product_id}o.mp4`;
            product_data.original.format.filename = opath;
        }
        if(product_data.proxy) {
            let path = product_data.proxy.format.filename.split('/').slice(0,-1).join('/');
            let ppath = `${path}/${newfile_name}_${product_data.product_id}p.mp4`;
            product_data.proxy.format.filename = ppath;
        }
        this.setState({cit_open: false, renaming: true});
        if(product_data.original) {
            product_data.parent.file_name = oldfile_name;
            product_data.file_name = newfile_name;
            product_data.wfstatus.renamed = true;
            putData(`${WFSRV_BACKEND}/workflow/rename`, product_data, (cb) => {
                console.log(":: Ingest - rename respond: ",cb);
                if(cb.status === "ok") {
                    setTimeout(() => this.setState({renaming: false, insert_button: false}), 2000);
                    this.selectproduct(product_data);
                } else {
                    setTimeout(() => this.setState({renaming: false, disabled: product_data.wfstatus.wfsend}), 2000);
                }
            });
        } else {
            postData(`${WFDB_BACKEND}/products/${product_data.product_id}/line`, newline, (cb) => {
                console.log(":: Post line in WFDB: ",cb);
                setTimeout(() => this.setState({renaming: false, insert_button: false}), 2000);
                this.selectproduct(product_data);
            });
        }

    };

    openCit = () => {
        let {product_data} = this.state;
        product_data.line = {manual_name: product_data.file_name};
        this.setState({product_data, cit_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false, insert_open: false});
    };

    setSpecial = (special) => {
        console.log(":: Selected send options: ", special);
        this.setState({special});
    };

    sendFile = () => {
        let {product_data,special} = this.state;
        product_data.special = special;
        console.log(":: Going to send File: ", product_data + " : to: ", special);
        this.setState({ sending: true, send_button: true });
        fetch(`${WFDB_BACKEND}/products/${product_data.product_id}/wfstatus/${special}?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}});
        setTimeout(() => this.setState({sending: false, disabled: false}), 2000);
        // putData(`${WFSRV_BACKEND}/workflow/send_aricha`, product_data, (cb) => {
        //     console.log(":: Aricha - send respond: ",cb);
        //     // While polling done it does not necessary
        //     //this.selectproduct(product_data);
        //     if(cb.status === "ok") {
        //         setTimeout(() => this.setState({sending: false, disabled: false}), 2000);
        //     } else {
        //         alert("Something goes wrong!");
        //     }
        // });

    };

    setProductName = (product_name) => {
        this.setState({product_name});
    };

    newProduct = () => {
        const {product_name, language, original_language} = this.state;
        let product_meta = newProductMeta(product_name, language, original_language);
        // if(doers)
        //     product_meta.parent.doers = doers;
        console.log(" :: New Meta: ", product_meta);
        putData(`${WFDB_BACKEND}/products/${product_meta.product_id}`, product_meta, (cb) => {
            console.log(":: PUT Respond: ",cb);
        });
        this.setState({product_name: "", doers: []});
    };

    removeProduct = () => {
        const {product_data} = this.state;
        removeData(`${WFDB_BACKEND}/products/${product_data.product_id}`, (cb) => {
            console.log(":: DELETE Respond: ",cb);
        });
    };

    setRemoved = () => {
        let {product_data} = this.state;
        console.log(":: Censor - set removed: ", product_data);
        this.setState({source: "", rename_button: true, send_button: true, insert_button: true});
        fetch(`${WFDB_BACKEND}/products/${product_data.product_id}/wfstatus/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
    };

    addDoer = (doers) => {
        console.log(doers);
        this.setState({doers});
    };

    uploadMaster = () => {
        this.props.masterUpload(this.state.product_data.product_id);
    };

    openProduct = () => {
        //TODO: Open modal with product files and options
    };

    newUnit = () => {
        //TODO: Make new unit
    };

    addNote = (product_data) => {
        const {note_area} = this.state;
        const {name} = this.props.user;
        const date = moment().format("YYYY-MM-DD HH:mm:ss");
        let {product} = product_data;
        product.notes.push({name,date,message: note_area});
        postData(`${WFDB_BACKEND}/products/${product_data.product_id}/product`, product, (cb) => {
            console.log(":: Post notes in WFDB: ",cb);
            product_data.product = product;
            this.setState({note_area: "", product_data});
        });
    };

    delNote = (product_data,i) => {
        let {product} = product_data;
        product.notes.splice(i, 1);
        postData(`${WFDB_BACKEND}/products/${product_data.product_id}/product`, product, (cb) => {
            console.log(":: Post notes in WFDB: ",cb);
            product_data.product = product;
            this.setState({product_data});
        });
    };

    render() {

        const {product_data, source, renaming, rename_button, cit_open, inserting, insert_button, note_area,
            filedata, metadata, special, send_button, sending, product_name, doers} = this.state;

        const send_options = [
            {key: 'Censor', text: 'Censor', value: 'censored'},
            {key: 'ToFix', text: 'ToFix', value: 'fix_req'},
            {key: 'Fixed', text: 'Fixed', value: 'fixed'},
            {key: 'Checked', text: 'Checked', value: 'checked'},
            {key: 'Aricha', text: 'Aricha', value: 'aricha'},
            {key: 'Buffer', text: 'Buffer', value: 'buffer'},
        ];

        let v = (<Icon name='checkmark' color='green' />);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let p = (<Icon color='blue' name='cogs'/>);

        let products = this.state.products.map((data) => {
            const {aricha,removed,wfsend,censored,checked,fixed,fix_req,post_req,posted,sub_req,subed,locked} = data.wfstatus;
            let notes = data.product ? data.product.notes : [];
            let subtitles = data.product && data.product.subtitle ? data.product.subtitle.url : null;
            let notes_list = notes.map((note,i) => {
                const {message,name,date} = note;
                let h = (<div><b>{name}</b><i style={{color: 'grey'}}> @ {date}</i></div>)
                return  (
                    <Message key={i} warning className='note_message' attached icon='copyright'
                             header={h} onDismiss={() => this.delNote(data,i)}
                             content={message} />
                )
            });
            let id = data.product_id;
            let ready = true;
            let title = ready ? data.product_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.product_name}</div>;
            //let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            if(removed) return false;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : 'admin_raw';
            return (
                <Table.Row
                    negative={rowcolor} positive={wfsend} warning={!ready} disabled={!ready || locked}
                    className={active} key={id} onClick={() => this.selectProduct(data)}>
                    <Table.Cell>
                        <Popup mountNode={document.getElementById("ltr-modal-mount")}
                               trigger={<Icon name='mail' color={notes.length > 0 ? 'red' : 'grey'} />} flowing hoverable>
                            {notes_list}
                            <Message warning attached>
                                <TextArea value={note_area} className='note_area'
                                          rows={5} placeholder='Notes...'
                                          onChange={(e,{value}) => this.setState({note_area: value})} />
                            </Message>
                            <Button attached='bottom' positive
                                    onClick={() => this.addNote(data)} >Add note</Button>
                        </Popup>
                    </Table.Cell>
                    <Table.Cell>
                        {subtitles ? <Modal trigger={<Icon name='wordpress forms' color={subtitles ? 'green' : 'grey'} />}
                               mountNode={document.getElementById("ltr-modal-mount")} >
                            <FileViewer filePath={`${WFSRV_BACKEND}${subtitles}`} fileType='docx' />
                        </Modal> : <Icon name='file' color={subtitles ? 'green' : 'grey'} />}
                    </Table.Cell>
                    <Table.Cell>{locked ? d : ""}{title}</Table.Cell>
                    <Table.Cell>{data.file_name}</Table.Cell>
                    <Table.Cell>{data.date}</Table.Cell>
                    <Table.Cell negative={!checked}>{censored && !checked ? p : checked ? v : x}</Table.Cell>
                    <Table.Cell negative={!fixed}>{fix_req && !fixed ? p : fixed ? v : x}</Table.Cell>
                    <Table.Cell negative={!posted}>{post_req && !posted ? p : posted ? v : x}</Table.Cell>
                    <Table.Cell negative={!subed}>{sub_req && !subed ? p : subed ? v : x}</Table.Cell>
                    <Table.Cell negative={!aricha}>{aricha ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        const doers_list = [
            {key: 0, text: "Michael Waintraub", value: "Michael Waintraub"},
            {key: 1, text: "Tanya Jdanova", value: "Tanya Jdanova"},
            {key: 2, text: "Hava Talal", value: "Hava Talal"},
            ];

        return (
            <Segment textAlign='center' className="ingest_segment" color='teal' raised>
                <Label  attached='top' className="trimmed_label">
                    {product_data.product_name ? product_data.product_name : ""}
                </Label>
                <Menu secondary >
                    <Menu.Item>
                        <Button positive={true}
                                disabled={product_name === ""}
                                onClick={this.newProduct}>New Product
                        </Button>
                    </Menu.Item>
                    <Menu.Item>
                        <Input className="product_input"
                               placeholder="Product name.."
                               onChange={e => this.setProductName(e.target.value)}
                               value={product_name} />
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown
                            placeholder="Add doer.."
                            selection
                            multiple
                            options={doers_list}
                            value={doers}
                            onChange={(e, {value}) => this.addDoer(value)} />
                    </Menu.Item>
                    <Menu.Item>
                        <Button negative={true}
                                disabled={product_data.product_id === undefined}
                                onClick={this.removeProduct}>Delete Product
                        </Button>
                    </Menu.Item>
                </Menu>
                <Message>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <Modal trigger={<Button color='brown' icon='play' disabled={!source} />}
                                   size='tiny'
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                            </Modal>
                        </Menu.Item>
                        <Menu.Item>
                            <Modal closeOnDimmerClick={false}
                                   trigger={<Button color='blue' icon='tags'
                                                    loading={renaming}
                                                    disabled={product_data.product_id === undefined}
                                                    onClick={this.openCit} />}
                                   onClose={this.onCancel}
                                   open={cit_open}
                                   closeIcon="close"
                                   mountNode={document.getElementById("cit-modal-mount")}>
                                <Modal.Content>
                                    <CIT metadata={product_data.line}
                                         onCancel={this.onCancel}
                                         onComplete={(x) => this.renameFile(x)}/>
                                </Modal.Content>
                            </Modal>
                        </Menu.Item>
                        <Menu.Menu position='left'>
                            <Menu.Item>
                                <Button color='teal' icon='archive'
                                        loading={inserting}
                                        disabled={!source}
                                        onClick={this.newUnit} />
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='orange' icon='upload' disabled={product_data.product_id === undefined}
                                        onClick={this.uploadMaster} />
                            </Menu.Item>
                            <Menu.Item>
                                <Modal trigger={<Button color='yellow' icon='folder'
                                                        disabled={product_data.product_id === undefined}
                                                        onClick={this.openProduct} />}
                                       mountNode={document.getElementById("ltr-modal-mount")}>
                                    <ProductFiles {...this.state} />
                                </Modal>
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='red' icon='close' disabled={product_data.product_id === undefined}
                                        onClick={this.setRemoved} />
                            </Menu.Item>
                        </Menu.Menu>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                    <Select compact options={send_options}
                                            defaultValue={special}
                                            placeholder='Send options'
                                            onChange={(e, {value}) => this.setSpecial(value)} />
                            </Menu.Item>
                            <Menu.Item>
                                <Button positive icon="arrow right"
                                        //disabled={send_button}
                                        disabled={product_data.product_id === undefined}
                                        onClick={this.sendFile} loading={sending} />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic structured className="ingest_table" fixed>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>Note</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Sub</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Title</Table.HeaderCell>
                            <Table.HeaderCell width={9}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Date</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Censor</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Fix</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Post</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Sub</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Done</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {products}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default ProductsAdmin;
