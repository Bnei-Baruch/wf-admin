import React, {Component} from 'react'
import moment from 'moment';
import {getData, putData, removeData, WFDB_BACKEND, WFSRV_BACKEND, postData, getToken} from '../../shared/tools';
import {Menu, Segment, Label, Button, Message, Dropdown, List, Divider} from 'semantic-ui-react'
import {dep_options} from "../../shared/consts";
import DatePicker from "react-datepicker";
import ProductFiles from "./ProductFiles";
import FilesUpload from "../Upload/FilesUpload";
import AddLanguage from "./AddLanguage";

class ProductsManager extends Component {

    state = {
        active: null,
        date: moment().format('YYYY-MM-DD'),
        drop_zone: false,
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
            this.setState({products: products, product_id: null, files: [], add_language: false, drop_zone: false})
        });
    };

    getProductFiles = (product_id) => {
        getData(`files/${this.state.language}?product_id=${product_id}`, (files) => {
            console.log(":: Files DB Data: ", files);
            this.setState({product_id, files, add_language: false, drop_zone: false});
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

    openCit = () => {
        let {product_data} = this.state;
        product_data.line = {manual_name: product_data.file_name};
        this.setState({product_data, cit_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false, insert_open: false});
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

    setProduct = (product_id) => {
        console.log(product_id)
        if(product_id === this.state.product_id) {
            //this.setState({product_id: null, files: []});
        } else {
            this.getProductFiles(product_id);
        }
    }

    addFile = () => {
        this.setState({drop_zone: !this.state.drop_zone});
    }

    addLanguage = () => {
        console.log("addLanguage")
        this.setState({add_language: true});
        //this.setState({drop_zone: !this.state.drop_zone});
    }

    render() {

        const {date, product_data, products, locale, drop_zone, add_language, language, files} = this.state;

        const products_list = products.map(data => {
                const {product_name, product_id, i18n} = data;
                const product_selected = product_id === this.state.product_id;
                const name = i18n[language] ? i18n[language].name : product_name;
                const description = i18n[language] ? i18n[language].description : "None";
                return (<List.Item key={product_id} active={product_id === this.state.product_id}>
                    <List.Content floated='right'>
                        {product_selected ? <Button onClick={i18n[language] ? this.addFile : this.addLanguage}>Add File</Button> : null}
                    </List.Content>
                    <List.Icon name='folder' />
                    <List.Content>
                        <List.Header as='a' onClick={() => this.setProduct(product_id)} >{name}</List.Header>
                        <List.Content>{description}</List.Content>
                        {product_selected && add_language ? <AddLanguage
                            language={language} product_id={product_id} getProducts={this.getProducts} /> : null}
                        {product_selected && drop_zone ? <FilesUpload product_id={product_id} language={language} /> : ''}
                        {product_selected ? <ProductFiles user={this.props.user} files={files} ref="files" /> : null}
                    </List.Content>
                </List.Item>)
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
                            <Dropdown compact
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
                <Divider />
                <List selection animated divided relaxed='very'>
                    {products_list}
                </List>
            </Segment>
        );
    }
}

export default ProductsManager;
