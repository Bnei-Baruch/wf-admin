import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import escapeRegExp from 'lodash/escapeRegExp';
import { Search } from 'semantic-ui-react';

import { findPath } from '../shared/utils';
import { TagsTree } from '../shared/shapes';

class TagsSearch extends Component {

  static propTypes = {
    tree: TagsTree.isRequired,
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

    const suggestions = tree.reduce((acc, root) => {
      const children = root.children || [];

      // search in each tag family
      const results = [];

      // DFS (pre-order) this collection
      let s = [...children];
      while (s.length > 0) {
        const node = s.shift();
        if (node.children) {
          s = node.children.concat(s);
        }

        if (regex.test(node.label)) {
          results.push({ id: node.uid, title: node.label, key: node.uid });
        }
      }

      if (results.length > 0) {
        acc.push({ name: root.label, results });
      }

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
        placeholder="הוסף תגית"
        noResultsMessage="לא נמצאו תגיות."
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

export default TagsSearch;
