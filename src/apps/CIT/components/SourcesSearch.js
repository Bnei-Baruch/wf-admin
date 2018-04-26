import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import escapeRegExp from 'lodash/escapeRegExp';
import { Search } from 'semantic-ui-react';

import { findPath } from '../shared/utils';
import { SourcesTree } from '../shared/shapes';

class SourcesSearch extends Component {

  static propTypes = {
    tree: SourcesTree.isRequired,
    onSelect: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.resetComponent();
  }

  resetComponent = () => this.setState({ suggestions: [], query: '' });

  doFilter = debounce(() => {
    const query        = this.state.query;
    const escapedValue = escapeRegExp(query.trim());
    if (escapedValue === '') {
      this.resetComponent();
      return;
    }

    const regex = new RegExp(escapedValue, 'i');

    const { tree } = this.props;

    const suggestions = tree.reduce((acc, author) => {
      const collections = author.children || [];

      // search in author's collections themselves
      let results = collections
        .filter(x => regex.test(x.name))
        .map(x => ({ id: x.uid, title: x.name, key: x.uid }));
      if (results.length > 0) {
        acc.push({ name: author.name, results });
      }

      // search in each collection
      collections.forEach((collection) => {
        results = [];

        // DFS (pre-order) this collection
        let s = [...(collection.children || [])];
        while (s.length > 0) {
          const node = s.shift();
          if (node.children) {
            s = node.children.concat(s);
          }

          if (regex.test(node.name)) {
            results.push({ id: node.uid, title: node.name, key: node.uid });
          }
        }

        if (results.length > 0) {
          acc.push({ name: `${author.name} - ${collection.name}`, results });
        }
      });

      return acc;
    }, []);

    this.setState({ query, suggestions });
  }, 150);

  handleResultSelect = (e, data) => {
    const path = findPath(this.props.tree, data.result.id);
    this.props.onSelect(path);
    this.resetComponent();
  };

  handleSearchChange = (e, data) => {
    this.setState({ query: data.value });
    this.doFilter();
  };

  renderResult = (result) => {
    const { query }     = this.state;
    const { id, title } = result;

    const escapedValue = escapeRegExp(query.trim());
    if (escapedValue === '') {
      return <div key={id}>{title}</div>;
    }

    const regex  = new RegExp(escapedValue, 'i');
    const markup = title.replace(regex, match => `<strong>${match}</strong>`);

    // eslint-disable-next-line react/no-danger
    return <div key={id} dangerouslySetInnerHTML={{ __html: markup }} />;
  };

  render() {
    const { suggestions, query } = this.state;

    return (
      <Search
        category
        fluid
        aligned="left"
        placeholder="הוסף מקור"
        noResultsMessage="לא נמצאו מקורות."
        input={{ fluid: true }}
        onResultSelect={this.handleResultSelect}
        onSearchChange={this.handleSearchChange}
        resultRenderer={this.renderResult}
        results={suggestions}
        value={query}
      />
    );
  }
}

export default SourcesSearch;
