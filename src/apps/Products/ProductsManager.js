import React, {Component, Fragment} from 'react'
import {getData, MDB_UNIT_URL} from '../../shared/tools';
import {
    Menu,
    Segment,
    Button,
    Dropdown,
    Input,
    Icon,
    Table,
    Pagination
} from 'semantic-ui-react'
import {CT_VIDEO_PROGRAM, dep_options, LANG_MAP, MDB_LANGUAGES, WF_LANGUAGES} from "../../shared/consts";
import DatePicker from "react-datepicker";
import he from "date-fns/locale/he";
import ProductFiles from "./ProductFiles";
import ProductsAdmin from "./ProductsAdmin";
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
        product: null,
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
        note_area: "",
        show_admin: false,
        show_filters: true,
        show_files: false,
        show_languages: false,
        add_language: false,
        page: 0,
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

    getProducts = (offset) => {
        console.log(offset)
        offset = offset < 0 ? 0 : offset || 0;
        const {filters} = this.state;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? `products/find?limit=10&offset=${offset}` : `products/find?limit=10&offset=${offset}&` + query.join('&');
        getData(path, products => {
            console.log(products)
            this.setState({page: offset, products: products, product_id: null, files: [], show_languages: false, selected_language: null, show_files: false})
        });
    };

    findProducts = () => {
        const {language, date} = this.state;
        getData(`products/find?language=${language}&date=${date}`, products => {
            console.log(products)
            this.setState({products: products, product_id: null, files: [], show_languages: false, selected_language: null, show_files: false})
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
            this.setState({product_id, files, drop_zone: false}, () => {
                //this.refs.files.sortFiles();
            });
        });
    };

    setProductLang = (language) => {
        if(!language) {
            this.removeFilter("language");
            return
        }
        const {filters} = this.state;
        filters.language = language
        this.setState({filters, language}, () => {
            this.getProducts();
        });
    };

    setFileLang = (file_language) => {
        this.setState({file_language});
    };

    selectDate = (date) => {
        if(!date) {
            this.removeFilter("date");
            return
        }
        const {filters} = this.state;
        filters.date = date.toLocaleDateString('sv');
        this.setState({filters, date}, () => {
            this.getProducts();
        });
    };

    selectCollection = (pattern) => {
        if(!pattern) {
            this.removeFilter("pattern");
            return
        }
        const {filters} = this.state;
        console.log("selectCollection: ", pattern);
        filters.pattern = pattern;
        this.setState({filters, pattern}, () => {
            this.getProducts();
        });
    };

    removeFilter = (f) => {
        const {filters} = this.state;
        delete filters[f];
        const value = f === "date" ? null : "";
        this.setState({filters, [f]: value}, () => {
            this.getProducts();
        });
    };

    setProduct = (product_id, product) => {
        console.log(product)
        if(!this.state.show_languages) {
            this.setState({product_id, product, show_languages: !this.state.show_languages});
        } else {
            this.setState({product_id: null, product: null, show_languages: false, selected_language: null, show_files: false}, () => {
                if(product_id !== this.state.product_id) {
                    this.setState({product_id, product, show_languages: true});
                }
            });
        }
    };

    editProduct = (product) => {
        console.log(product)
        this.setState({product, show_admin: true});
    };

    addFile = () => {
        this.setState({drop_zone: true});
    };

    addLanguage = () => {
        console.log("addLanguage")
        this.setState({add_language: true});
    };

    addProduct = () => {
        this.setState({show_admin: true, product: null});
    };

    setLang = (selected_language) => {
        if(!this.state.show_files) {
            this.getProductFiles()
            this.setState({selected_language, show_files: !this.state.show_files});
        } else {
            this.setState({selected_language: null, files: [], show_files: !this.state.show_files}, () => {
                if(selected_language !== this.state.selected_language) {
                    this.setState({selected_language, show_files: !this.state.show_files});
                }
            });
        }
    };

    toggleProductAdmin = () => {
        this.setState({show_admin: false});
    };

    finishProduct = () => {
        this.getProducts();
        this.setState({show_admin: false, product: null});
    };

    addNewLanguage = () => {
        this.setLang();
        this.toggleAddLanguage();
    }

    toggleAddLanguage = () => {
        this.setState({add_language: !this.state.add_language});
    };

    finishLanguage = () => {
        this.toggleAddLanguage();
        this.getProducts();
        this.setState({product_id: null, product: null, show_languages: false});
    }

    render() {

        const {pattern, collections, date, product, products, locale, language, files, show_languages, selected_language} = this.state;

        const products_list = products.map(data => {
                const {product_name, product_id, date, language, line: {unit_id, uid, final_name, film_date, collection_name}, i18n} = data;
                const product_selected = product_id === this.state.product_id;
                const href = unit_id ? `${MDB_UNIT_URL}/${unit_id}` : `${MDB_UNIT_URL}/?query=${uid}`;
                const unit_exist = i18n[WF_LANGUAGES[language]].archive;
                return (<Fragment key={product_id + "div"}>
                    <Table.Row key={product_id} verticalAlign='top'>
                        <Table.Cell collapsing>
                            <Icon link name={product_selected ? 'minus' : 'plus'} color='blue'
                                  onClick={() => this.setProduct(product_id, data)}/>
                        </Table.Cell>
                        <Table.Cell>{product_name}</Table.Cell>
                        <Table.Cell>
                            <Button basic positive compact
                                    onClick={() => this.editProduct(data)}>EDIT</Button>&nbsp;&nbsp;&nbsp;
                            {unit_exist ? <Icon link name='archive' color='blue' onClick={() => window.open(href, "_blank")} /> : null}
                        </Table.Cell>
                        <Table.Cell>{film_date}</Table.Cell>
                        <Table.Cell>{date}</Table.Cell>
                        <Table.Cell>{collection_name}</Table.Cell>
                        <Table.Cell>{LANG_MAP[language].text}</Table.Cell>
                    </Table.Row>
                    {show_languages && product_selected ?
                        <Table.Row key={product_id + "lang"} verticalAlign='top'>
                            <Table.Cell/>
                            <Table.Cell colSpan={3}>
                                {show_languages && product_selected ?
                                    Object.keys(i18n).map(la => {
                                        return (
                                            <Table basic='very' key={product_id + la}>
                                                <Table.Row key={la} verticalAlign='top'>
                                                    <Table.Cell collapsing>
                                                        <Icon link name={selected_language === MDB_LANGUAGES[la] ? 'minus' : 'plus'}
                                                              color='blue' onClick={() => this.setLang(MDB_LANGUAGES[la])} />
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        {LANG_MAP[MDB_LANGUAGES[la]].text}
                                                        {product_selected && selected_language === MDB_LANGUAGES[la] ?
                                                            <ProductFiles user={this.props.user} files={files}
                                                                          file_name={final_name}
                                                                          product={product}
                                                                          product_id={product_id}
                                                                          metadata={i18n[la]}
                                                                          lang={selected_language} ref="files"
                                                                          getProductFiles={this.getProductFiles}
                                                                          getProducts={this.getProducts}
                                                                          toggleAddLanguage={this.toggleAddLanguage} /> : null}
                                                    </Table.Cell>
                                                    <Table.Cell />
                                                    <Table.Cell />
                                                </Table.Row>
                                            </Table>
                                        )
                                    }) : null
                                }
                                {show_languages && product_selected ?
                                    <Table basic='very'>
                                        <Table.Row verticalAlign='top'>
                                            <Table.Cell collapsing>
                                                <Icon link name='plus' color='blue' onClick={this.addNewLanguage}/>
                                            </Table.Cell >
                                            <Table.Cell onClick={this.addNewLanguage}>Add Language</Table.Cell>
                                        </Table.Row>
                                    </Table> : null
                                }
                            </Table.Cell>
                            <Table.Cell/>
                            <Table.Cell/>
                            <Table.Cell/>
                            <Table.Cell/>
                        </Table.Row> : null
                    }
                </Fragment>)
            }
        );

        const col_options = collections.map(data => {
            if (collections.length > 0) {
                const {uid, name, properties: {pattern}} = data;
                return ({key: uid, value: pattern, text: name})
            }
        });

        return (
            <Segment textAlign='left' className="ingest_segment" basic>
                <Menu secondary>
                    <Menu.Item>Filter by:</Menu.Item>
                    <Menu.Item>
                        <Dropdown
                            placeholder="Original language:"
                            selection
                            clearable
                            options={dep_options}
                            language={language}
                            onChange={(e, {value}) => this.setProductLang(value)}
                            value={language}>
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown
                            search
                            clearable
                            selection
                            options={col_options}
                            placeholder='Collections:'
                            value={pattern}
                            onChange={(e, {value}) => this.selectCollection(value)}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <DatePicker
                            locale={locale}
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
                            onChange={this.selectDate}
                        />
                    </Menu.Item>
                    <Menu.Item position='right'>
                        <Button positive={true} onClick={this.addProduct}>Add Product</Button>
                        <ProductsAdmin
                            user={this.props.user}
                            product={this.state.product}
                            show_admin={this.state.show_admin}
                            finishProduct={this.finishProduct}
                            toggleProductAdmin={this.toggleProductAdmin} />
                        <AddLanguage
                            user={this.props.user}
                            product_id={this.state.product_id}
                            add_language={this.state.add_language}
                            product={this.state.product}
                            selected_language={selected_language}
                            finishLanguage={this.finishLanguage}
                            toggleAddLanguage={this.toggleAddLanguage} />
                    </Menu.Item>
                </Menu>
                <Table basic='very'>
                    <Table.Header fullWidth>
                        <Table.Row warning>
                            <Table.HeaderCell />
                            <Table.HeaderCell width={8}>Product Name</Table.HeaderCell>
                            <Table.HeaderCell width={2} />
                            <Table.HeaderCell >Film Date</Table.HeaderCell>
                            <Table.HeaderCell >Date Added</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Collection</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Original Language</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {products_list}
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='7' textAlign='center'>
                                <Button.Group>
                                <Button basic disabled={this.state.page === 0}
                                        onClick={() => this.getProducts(this.state.page - 10)}>
                                    <Icon name='left chevron' />
                                </Button>
                                <Button basic>
                                    {this.state.page}-{this.state.page+10}
                                </Button>
                                <Button basic disabled={products.length === 0}
                                        onClick={() => this.getProducts(this.state.page + 10)}>
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

export default ProductsManager;
