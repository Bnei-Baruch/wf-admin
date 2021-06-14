import React, {Component} from 'react'
import {getData, putData, removeData, WFDB_BACKEND, WFSRV_BACKEND, postData, getToken} from '../../shared/tools';
import {Menu, Segment, Label, Button, Grid, Dropdown, List, Flag, Input, Icon, Table, Checkbox, Pagination} from 'semantic-ui-react'
import {CT_VIDEO_PROGRAM, dep_options, LANG_MAP} from "../../shared/consts";
import DatePicker from "react-datepicker";
import he from "date-fns/locale/he";
import ProductFiles from "./ProductFiles";
import FilesUpload from "../Upload/FilesUpload";
import AddLanguage from "./AddLanguage";
import {fetchCollections} from "../CIT/shared/store";
import {isActive} from "../CIT/shared/utils";

class ProductsManager extends Component {

    state = {
        active: null,
        collections: [],
        date: null,
        filters: {},
        drop_zone: false,
        insert_open: false,
        insert_button: true,
        inserting: false,
        product_name: "",
        product: {i18n: {}},
        selected_language: null,
        products: [],
        files: [],
        product_data: {},
        filedata: {},
        kmedia_option: false,
        language: "",
        file_language: null,
        pattern: "",
        locale: he,
        original_language: "heb",
        metadata: {},
        renaming: false,
        rename_button: false,
        send_button: true,
        sending: false,
        special: "censored",
        source: null,
        note_area: "",
        show_filters: true,
        show_files: false,
        show_languages: false,
    };

    componentDidMount() {
        this.getProducts();
        fetchCollections(data => {
            const collections = this.getActiveCollections(data);
            this.setState({collections});
        });
    };



    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    // eslint-disable-next-line class-methods-use-this
    getActiveCollections = (collections) => {
        const active = (collections.get(CT_VIDEO_PROGRAM) || []).filter(isActive);

        active.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        console.log(active)
        return active;
    };

    getProducts = () => {
        const {filters} = this.state;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? 'products' : 'products/find?' + query.join('&');
        getData(path, products => {
            console.log(products)
            this.setState({products: products, product_id: null, files: [], add_language: false, drop_zone: false})
        });
    };

    findProducts = () => {
        const {language, date} = this.state;
        getData(`products/find?language=${language}&date=${date}`, products => {
            console.log(products)
            this.setState({products: products, product_id: null, files: [], add_language: false, drop_zone: false})
        });
    };

    getProductFiles = () => {
        getData(`files/find?product_id=${this.state.product_id}`, (files) => {
            console.log(":: Files DB Data: ", files);
            this.setState({files});
        });
    };

    getProductFilesByLang = (product_id, lang) => {
        getData(`files/find?product_id=${product_id}&languages=${lang}`, (files) => {
            console.log(":: Files DB Data: ", files);
            this.setState({product_id, files, add_language: false, drop_zone: false}, () => {
                //this.refs.files.sortFiles();
            });
        });
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

    applyFilter = () => {
        this.getProducts();
    };

    setProductLang = (language) => {
        const {filters} = this.state;
        filters.language = language
        this.setState({filters, language});
    };

    setFileLang = (file_language) => {
        this.setState({file_language, drop_zone: false, add_language: false});
    };

    selectDate = (date) => {
        const {filters} = this.state;
        filters.date = date.toLocaleDateString('sv');
        this.setState({filters, date});
    };

    selectCollection = (pattern) => {
        const {filters} = this.state;
        console.log("selectCollection: ", pattern);
        filters.pattern = pattern;
        this.setState({filters, pattern});
    };

    removeFilter = (f) => {
        const {filters} = this.state;
        delete filters[f];
        const value = f === "date" ? null : "";
        this.setState({filters, [f]: value}, () => {
            this.getProducts();
        });
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

    setProduct = (product_id, product) => {
        if(!this.state.show_languages) {
            console.log(product)
            this.setState({product_id, product, show_languages: !this.state.show_languages});
        } else {
            this.setState({product_id: null, product: {i18n: {}}, show_languages: !this.state.show_languages});
        }
    };

    addFile = () => {
        this.setState({drop_zone: true});
    };

    addLanguage = () => {
        console.log("addLanguage")
        this.setState({add_language: true});
    };

    setLang = (selected_language) => {
        if(!this.state.show_files) {
            this.getProductFiles()
            this.setState({selected_language, show_files: !this.state.show_files});
        } else {
            this.setState({selected_language: null, files: [], show_files: !this.state.show_files});
        }
    }

    render() {

        const {filters, pattern, collections, date, show_filters, product, products, locale, drop_zone, add_language, language, files, file_language, show_languages, show_files, selected_language} = this.state;

        const options = [
            { key: 'title', description: 'Choose Language:', disabled: true},
            { key: 'd', description: '', disabled: true},
            { key: 'il', flag: 'il', text: 'Hebrew', value: 'heb' },
            { key: 'ru', flag: 'ru',  text: 'Russian', value: 'rus' },
            { key: 'en', flag: 'us',  text: 'English', value: 'eng' },
        ]

        const flags = {
            heb: (<Flag name='il'/>),
            rus: (<Flag name='ru'/>),
            eng: (<Flag name='us'/>)
        }

        const products_list = products.map(data => {
                const {product_name, description, product_id, i18n, date, language, pattern} = data;
                const product_selected = product_id === this.state.product_id;
                return (

                    <Table.Row key={product_id} verticalAlign='top' >
                        <Table.Cell collapsing>
                            <Icon link name={product_selected ? 'minus' : 'plus'} color='blue' onClick={() => this.setProduct(product_id, data)} />
                        </Table.Cell>
                        <Table.Cell>
                            {product_name}
                            {show_languages && product_selected ?
                                Object.keys(data?.i18n).map(lang => {
                                    return (
                                        <Table basic='very'>
                                        <Table.Row key={lang} verticalAlign='top' >
                                            <Table.Cell collapsing>
                                                <Icon link name={selected_language === lang ? 'minus' : 'plus'} color='blue' onClick={() => this.setLang(lang)} />
                                            </Table.Cell>
                                            <Table.Cell>
                                                {LANG_MAP[lang].text}
                                                {product_selected && selected_language === lang ? <ProductFiles user={this.props.user} files={files} lang={selected_language} ref="files" /> : null}
                                            </Table.Cell>
                                        </Table.Row>
                                        </Table>
                                    )
                                }) : null
                            }
                            {/*{product_selected ? <ProductFiles user={this.props.user} files={files} langs={i18n} ref="files" /> : null}*/}
                        </Table.Cell>
                        <Table.Cell>{date}</Table.Cell>
                        <Table.Cell>{date}</Table.Cell>
                        <Table.Cell>{pattern}</Table.Cell>
                        <Table.Cell>{language}</Table.Cell>
                    </Table.Row>
                )
            }
        );

        const col_options = collections.map(data => {
            if(collections.length > 0) {
                const {uid, name, properties:{pattern}} = data;
                return({key: uid, value: pattern, text: name})
            }
        });

        const active_filters = Object.keys(filters).map(f => {
            return (<Label key={f} as='a' size='big' color='blue'>{f}
                      <Icon name='delete' onClick={() => this.removeFilter(f)}/>
                    </Label>)
        });

        return (
            <Segment textAlign='left' className="ingest_segment" color='green' raised>
                <Label attached='top' size='big' >
                    <Icon name='filter' size='big' color={show_filters ? 'green' : 'grey'} onClick={() => this.setState({show_filters: !this.state.show_filters})} />
                    {active_filters}
                </Label>
                <br /><br /><br />
                {show_filters ?
                <Menu secondary>
                    <Menu.Item>
                        <Button color='blue'
                                disabled={Object.keys(filters).length === 0}
                                onClick={this.applyFilter}>Apply
                        </Button>
                    </Menu.Item>
                        <Menu.Item>
                            <Dropdown className='icon' button labeled icon='world'
                                // error={!language}
                                placeholder="Original language:"
                                selection
                                options={dep_options}
                                language={language}
                                onChange={(e,{value}) => this.setProductLang(value)}
                                value={language} >
                            </Dropdown>
                        </Menu.Item>
                        <Menu.Item>
                            <Dropdown className='icon' button labeled icon='tag'
                                // error={!pattern}
                                search
                                selection
                                options={col_options}
                                placeholder='Collections:'
                                value={pattern}
                                onChange={(e,{value}) => this.selectCollection(value)}
                            />
                        </Menu.Item>
                    <Menu.Item>
                        <DatePicker
                            locale={locale}
                            customInput={<Input action={{ icon: 'calendar' }} actionPosition='left' placeholder='Dagte...'  />}
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={new Date()}
                            openToDate={new Date()}
                            selected={date ? date : null}
                            placeholderText="Date:"
                            onChange={this.selectDate}
                        />
                    </Menu.Item>
                    <Menu.Item position='right'>
                            <Button positive={true}
                                    onClick={this.newProduct}>Add Product
                            </Button>
                    </Menu.Item>
                    </Menu> : null}

                <Table basic='very'>
                    <Table.Header fullWidth>
                        <Table.Row>
                            <Table.HeaderCell />
                            <Table.HeaderCell width={7}>Product Name</Table.HeaderCell>
                            <Table.HeaderCell>Film Date</Table.HeaderCell>
                            <Table.HeaderCell>Date Added</Table.HeaderCell>
                            <Table.HeaderCell>Collection</Table.HeaderCell>
                            <Table.HeaderCell>Original Language</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {products_list}
                    </Table.Body>

                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='6' textAlign='center'>
                                <Pagination defaultActivePage={1} disabled totalPages={5} />
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment>
        );
    }
}

export default ProductsManager;
