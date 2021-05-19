import React, {Component} from 'react'
import moment from 'moment';
import {getData, putData, removeData, WFDB_BACKEND, WFSRV_BACKEND, postData, getToken} from '../../shared/tools';
import {Menu, Segment, Label, Button, Message, Dropdown, Accordion} from 'semantic-ui-react'
import {dep_options} from "../../shared/consts";
import DatePicker from "react-datepicker";
import ProductFiles from "./ProductFiles";

class ProductsManager extends Component {

    state = {
        active: null,
        cit_open: false,
        date: moment().format('YYYY-MM-DD'),
        doers: [],
        insert_open: false,
        insert_button: true,
        inserting: false,
        product_name: "",
        products: [],
        files: [],
        product_data: {},
        filedata: {},
        kmedia_option: false,
        language: "heb",
        locale: "he",
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
        // let ival = setInterval(() => getData('products', (data) => {
        //         if (JSON.stringify(this.state.products) !== JSON.stringify(data))
        //             this.setState({products: data})
        //     }), IVAL );
        // this.setState({ival});
        this.getProducts(this.state.language);
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    getProducts = (language) => {
        getData(`products`, products => {
            console.log(products)
            this.setState({products: products})
        });
    };

    getProductFiles = (product_id) => {
        getData(`files/find?key=product_id&value=${product_id}`, (files) => {
            console.log(":: Files DB Data: ", files);
            this.setState({files});
        });
    };

    selectDate = (date) => {
        this.setState({date: date.format('YYYY-MM-DD')});
    };

    selectProduct = (product_data) => {
        console.log(":: ProductsAdmin - selected product: ", product_data);
        this.props.setProduct(product_data.product_id);

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

    setProductLang = (language) => {
        this.setState({language});
        this.getProducts(language);
    }

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

    setProduct = (product_id) => {
        console.log(product_id)
        this.setState({product_id});
        this.getProductFiles(product_id)
        // this.refs.files.getProductFiles(product_id);
    }

    render() {

        const {date, product_data, products, locale, product_name, language, files} = this.state;


        const panels = products.map(data => {
                const {product_name, product_id} = data;
                return ({key: product_id,
                    title: {
                        content:
                            <Label className='product_label' size='big' basic
                            color={product_id === this.state.product_id ? 'green' : ''}
                                   content={product_name} onClick={() => this.setProduct(product_id)} />,
                        // icon: 'shopping cart',
                    },
                    content: {
                        content: (
                            <ProductFiles user={this.props.user} files={files} ref="files" />
                        ),
                    },
                    text: product_name, value: data
                })
            }
        );


        return (
            <Segment textAlign='left' className="ingest_segment" color='green' raised>
                {/*<Label attached='top' className="trimmed_label">*/}
                {/*    {product_data.product_name ? product_data.product_name : ""}*/}
                {/*</Label>*/}
                <Message floating
                    icon='shopping cart'
                    content={<Menu secondary >
                        <Menu.Item>
                            <Dropdown
                                error={!language}
                                placeholder="Language:"
                                selection
                                options={dep_options}
                                language={language}
                                onChange={(e,{value}) => this.setProductLang(value)}
                                value={language} >
                            </Dropdown>
                        </Menu.Item>
                        <Menu.Item>
                            <DatePicker
                                className="datepickercs"
                                locale={locale}
                                dateFormat="YYYY-MM-DD"
                                showYearDropdown
                                showMonthDropdown
                                scrollableYearDropdown
                                maxDate={moment()}
                                openToDate={moment(date)}
                                selected={moment(date)}
                                onChange={this.selectDate}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            {/*<Dropdown*/}
                            {/*    fluid*/}
                            {/*    search*/}
                            {/*    selection*/}
                            {/*    options={products_options}*/}
                            {/*    placeholder='Select Product...'*/}
                            {/*    onChange={(e,{value}) => this.selectProduct(value)}*/}
                            {/*/>*/}
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                            </Menu.Item>
                            <Menu.Item>
                            </Menu.Item>
                            <Menu.Item>
                                <Button negative={true}
                                        disabled={product_data.product_id === undefined}
                                        onClick={this.removeProduct}>Delete Product
                                </Button>
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>}
                />
                <Accordion  defaultActiveIndex={0} panels={panels} fluid />
            </Segment>
        );
    }
}

export default ProductsManager;
