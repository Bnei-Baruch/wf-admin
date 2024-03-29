import React, {Component, Fragment} from 'react'
import {getData, getUnit, MDB_EXTERNAL_URL, MDB_LOCAL_URL, MDB_UNIT_URL, toHms} from '../../shared/tools';
import {
    Menu,
    Segment,
    Button,
    Dropdown,
    Input,
    Icon,
    Table,
    Popup,
    Grid, Loader
} from 'semantic-ui-react'
import {
    CT_CLIPS,
    CT_VIDEO_PROGRAM,
    dep_options,
    LANG_MAP,
    MDB_LANGUAGES,
    ui_options,
    WF_LANGUAGES
} from "../../shared/consts";
import DatePicker from "react-datepicker";
import ProductFiles from "./ProductFiles";
import ProductsAdmin from "./ProductsAdmin";
import AddLanguage from "./AddLanguage";
import {fetchCollections} from "../CIT/shared/store";
import {isActive} from "../CIT/shared/utils";

class ProductsManager extends Component {

    state = {
        active: null,
        collections: {},
        ct_option_type: "",
        date: null,
        film_date: null,
        filters: {},
        file_name: "",
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
        collection_uid: "",
        pattern: "",
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
        ui_language: "en",
        page: 0,
        parent_info: <Segment basic><Loader active /></Segment>
    };

    componentDidMount() {
        this.getProducts();
        fetchCollections(data => {
            const collections = {programs: [], clips: []};
            collections.programs = this.getActiveCollections(data, CT_VIDEO_PROGRAM);
            collections.clips = this.getActiveCollections(data, CT_CLIPS);
            this.setState({collections});
        });
    };



    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    searchByProductName = () => {
        const {file_name} = this.state;
        getData(`products/find?key=product_name&value=${file_name}`, products => {
            console.log(products)
            this.setState({products: products, file_name: ""})
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getActiveCollections = (collections, type) => {
        const active = (collections.get(type) || []).filter(isActive);

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
        const {filters, page} = this.state;
        offset = offset < 0 ? 0 : offset !== undefined ? offset : page;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? `products/kv?limit=10&offset=${offset}` : `products/kv?limit=10&offset=${offset}&` + query.join('&');

        if(filters.pattern) {
            let id = filters.pattern;
            if(id.match(/^([a-zA-Z0-9]{8})$/)) {
                path = `products/kv?pattern=${id}`
            } else {
                path = `products/kv?product_id=${id}`
            }
        }

        getData(path, products => {
            console.log(products)
            this.setState({page: offset, products: products, product_id: null, files: [], show_languages: false, selected_language: null, show_files: false})
        });
    };

    kvProducts = () => {
        const {language, film_date} = this.state;
        getData(`products/kv?language=${language}&film_date=${film_date}`, products => {
            console.log(products)
            this.setState({products: products, product_id: null, files: [], show_languages: false, selected_language: null, show_files: false})
        });
    };

    getProductFiles = () => {
        getData(`files/kv?product_id=${this.state.product_id}`, (files) => {
            console.log(":: Files DB Data: ", files);
            this.setState({files});
        });
    };

    getProductFilesByLang = (product_id, lang) => {
        getData(`files/kv?product_id=${product_id}&languages=${lang}`, (files) => {
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
        this.setState({filters, language, page: 0}, () => {
            this.getProducts();
        });
    };

    setFileLang = (file_language) => {
        this.setState({file_language});
    };

    selectDate = (film_date) => {
        if(!film_date) {
            this.removeFilter("film_date");
            return
        }
        const {filters} = this.state;
        filters.film_date = film_date.toLocaleDateString('sv');
        this.setState({filters, film_date, page: 0}, () => {
            this.getProducts();
        });
    };

    selectCollection = (collection_uid) => {
        if(!collection_uid) {
            this.removeFilter("collection_uid");
            return
        }
        const {filters} = this.state;
        console.log("selectCollection: ", collection_uid);
        filters.collection_uid = collection_uid;
        this.setState({filters, collection_uid, page: 0}, () => {
            this.getProducts();
        });
    };

    selectUnit = (pattern) => {
        if(!pattern) {
            this.removeFilter("pattern");
            return
        }
        const {filters} = this.state;
        console.log("selectUnit: ", pattern);
        filters.pattern = pattern;
        this.setState({filters, pattern, page: 0}, () => {
            this.getProducts();
        });
    };

    removeFilter = (f) => {
        const {filters} = this.state;
        delete filters[f];
        const value = f === "film_date" ? null : "";
        this.setState({filters, [f]: value, page: 0}, () => {
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
            this.getProductFiles();
            this.setState({selected_language, show_files: !this.state.show_files});
        } else {
            this.setState({selected_language: null, show_files: !this.state.show_files}, () => {
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
    };

    parentInfo = (parent) => {
        const {ui_language} = this.state;
        const local = window.location.hostname === "wfsrv.bbdomain.org";
        const url = local ? MDB_LOCAL_URL : MDB_EXTERNAL_URL;
        getUnit(`${url}/${parent.mdb_id}/`, (unit) => {
            const {uid, i18n, properties: {film_date, duration}} = unit;
            const name = i18n[ui_language].name;
            const dur = toHms(duration)
            const parent_info = (
                <Grid centered divided columns={4} stretched>
                    <Grid.Column textAlign='center'>
                        {uid}
                    </Grid.Column>
                    <Grid.Column textAlign='center'>
                        {film_date}
                    </Grid.Column>
                    <Grid.Column textAlign='center'>
                        {dur}
                    </Grid.Column>
                    <Grid.Column textAlign='center'>
                        {name}
                    </Grid.Column>
                </Grid>
            )
            this.setState({parent_info});
        });
    }

    render() {
        const {file_name, page, ui_language, ct_option_type, collection_uid, pattern, collections, film_date, product, products, parent_info, language, files, show_languages, selected_language} = this.state;
        const {rooter, adminer, archer, viewer} = this.props.user;
        const product_permission = adminer || rooter;
        const lang_permission = archer || adminer || rooter;

        const products_list = products.map(data => {
                const {product_name, product_id, parent, date, film_date, language, line: {unit_id, uid, final_name, collection_name}, i18n, properties: {duration}} = data;
                const product_selected = product_id === this.state.product_id;
                const href = unit_id ? `${MDB_UNIT_URL}/${unit_id}` : `${MDB_UNIT_URL}/?query=${uid}`;
                const unit_exist = i18n[WF_LANGUAGES[language]].archive;
                return (<Fragment key={product_id + "div"}>
                    <Table.Row key={product_id} verticalAlign='top' warning={product_selected} selectable>
                        <Table.Cell collapsing>{product_id}</Table.Cell>
                        <Table.Cell><Icon link name={product_selected ? 'minus' : 'plus'} color='blue'
                                          onClick={() => this.setProduct(product_id, data)}/>{product_name}</Table.Cell>
                        <Table.Cell verticalAlign='top'>
                            {product_permission ?
                                <div><Button basic positive compact
                                        onClick={() => this.editProduct(data)}>EDIT</Button>&nbsp;&nbsp;&nbsp;
                            {unit_exist ? <Icon link name='archive' color='blue' onClick={() => window.open(href, "_blank")} /> : null}
                                </div>: null}

                        </Table.Cell>
                        <Table.Cell textAlign='center'>
                            <Popup flowing position='top center'
                                content={parent_info}
                                trigger={<Icon size='large' name='attention' />}
                                onOpen={() => this.parentInfo(parent)}
                                onClose={() => this.setState({parent_info: <Segment basic><Loader active /></Segment>})}
                            />
                        </Table.Cell>
                        <Table.Cell>{duration}</Table.Cell>
                        <Table.Cell singleLine>{film_date}</Table.Cell>
                        <Table.Cell singleLine>{date}</Table.Cell>
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
                                            <Table basic='very' compact key={product_id + la}>
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
                                {lang_permission && show_languages && product_selected ?
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

        const col_options = (collections[ct_option_type] || []).map(data => {
            if (collections[ct_option_type].length > 0) {
                const {uid, i18n} = data;
                return ({key: uid, value: uid, text: i18n[ui_language].name})
            }
        });

        return (
            <Segment textAlign='left' basic>
                <Menu secondary >
                    <Menu.Item>
                        <Input className="product_name" type='text' placeholder='Search by product name..' action value={file_name}
                               onChange={(e, { value }) => this.setState({file_name: value})}>
                            <input />
                            {/*<Select compact options={options} value={search}*/}
                            {/*        onChange={(e, { value }) => this.setState({search: value})}/>*/}
                            <Button type='submit' color='blue' disabled={!file_name}
                                    onClick={() => this.searchByProductName(file_name)}>Search</Button>
                        </Input>
                    </Menu.Item>
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
                            compact
                            selection
                            options={[{key: 11, value: "clips", text: "Clips"}, {key: 12, value: "programs", text: "Programs"}]}
                            placeholder='Type:'
                            value={ct_option_type}
                            onChange={(e, {value}) => this.setState({ct_option_type: value})}
                        />
                        <Dropdown
                            search
                            clearable
                            selection
                            options={col_options}
                            placeholder='Collections:'
                            value={collection_uid}
                            onChange={(e, {value}) => this.selectCollection(value)}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <DatePicker
                            // locale={locale}
                            customInput={<Input icon={
                                <Icon name={film_date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("film_date")} />
                            }/>}
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={new Date()}
                            openToDate={new Date()}
                            selected={film_date ? film_date : null}
                            placeholderText="Film date:"
                            onChange={this.selectDate}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Input placeholder='ID' value={pattern} icon={
                            <Icon name={pattern ? 'close' : ''} link onClick={() => this.removeFilter("pattern")} />
                        } onChange={(e, {value}) => this.selectUnit(value)} />
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            {product_permission ?
                            <Button positive={true} onClick={this.addProduct}>Add Product</Button>
                            : null}
                        </Menu.Item>
                        <Menu.Item position='right'>
                            <Dropdown
                                placeholder="Language:"
                                selection
                                compact
                                options={ui_options}
                                onChange={(e, {value}) => this.setState({ui_language: value})}
                                value={ui_language}>
                            </Dropdown>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
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
                <Table compact unstackable>
                    <Table.Header fullWidth>
                        <Table.Row>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell >Product Name</Table.HeaderCell>
                            <Table.HeaderCell  />
                            <Table.HeaderCell width={1}>Original Program</Table.HeaderCell>
                            <Table.HeaderCell >Duration</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Film Date</Table.HeaderCell>
                            <Table.HeaderCell singleLine>Date Added</Table.HeaderCell>
                            <Table.HeaderCell >Collection</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Original Language</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {products_list}
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='9' textAlign='center'>
                                <Button.Group>
                                <Button basic disabled={page === 0}
                                        onClick={() => this.getProducts(page - 10)}>
                                    <Icon name='left chevron' />
                                </Button>
                                <Button basic>{page}-{page + products.length}</Button>
                                <Button basic disabled={products.length < 10}
                                        onClick={() => this.getProducts(page + 10)}>
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
