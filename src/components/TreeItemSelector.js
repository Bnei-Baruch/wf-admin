import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Button, Dropdown } from 'semantic-ui-react';

import { Source, Tag } from '../shared/shapes';

class TreeItemSelector extends Component {

  static propTypes = {
    tree: PropTypes.arrayOf(PropTypes.oneOfType([Source, Tag])).isRequired,
    fieldLabel: PropTypes.func,
    onSelect: PropTypes.func.isRequired
  };

  static defaultProps = {
    fieldLabel: x => x.name
  };

  state = {
    selection: []
  };

  onSelectionChange = (level, idx, isFinal) => {
    this.setState({ selection: this.state.selection.slice(0, level).concat([idx]) },
      () => {
        // UX shortcut for "final" selection when hitting a leaf node
        if (isFinal) {
          this.onFinalSelection();
        }
      }
    );
  };

  onFinalSelection = () => {
    const selection = this.state.selection;

    // Map index selection to real nodes
    let l       = this.props.tree;
    const nodes = [];
    for (let i = 0; i < selection.length; i++) {
      const node = l[selection[i]];
      nodes.push(node);
      l = node.children || [];
    }

    this.props.onSelect(nodes);
  };

  renderLevelDropdown(level, idx, text) {
    return (
      <Dropdown text={text} scrolling>
        <Dropdown.Menu>
          {
            level.map((x, j) => (
              <Dropdown.Item
                key={x.uid || x.code}
                text={`${j + 1}. ${this.props.fieldLabel(x)}`}
                onClick={() => this.onSelectionChange(idx, j, (x.children || []).length === 0)}
              />))
          }
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const { tree, fieldLabel } = this.props;
    const selection            = this.state.selection;

    const crumbs = [];
    let level    = tree;

    for (let i = 0; i < selection.length; i++) {
      const selectedChild = level[selection[i]];
      const nextLevel     = selectedChild.children || [];
      const nlHasChildren = nextLevel.length > 0;

      crumbs.push((<Breadcrumb.Section key={`s${i}`} link={nlHasChildren} active={!nlHasChildren}>
        {this.renderLevelDropdown(level, i, fieldLabel(selectedChild))}
      </Breadcrumb.Section>));
      if (nlHasChildren) {
        crumbs.push(<Breadcrumb.Divider key={`d${i}`} icon="left angle" />);
      }
      level = nextLevel;
    }

    if (level.length > 0) {
      crumbs.push((<Breadcrumb.Section key={selection.length} active>
        {this.renderLevelDropdown(level, selection.length + 1, 'בחר מהרשימה')}
      </Breadcrumb.Section>));
    }

    return (
      <div>
        <Breadcrumb>{crumbs}</Breadcrumb>
        {
          (selection.length > 0) ?
            <Button
              content="הוסף"
              size="mini"
              floated="right"
              color="teal"
              onClick={this.onFinalSelection}
            /> :
            null
        }
      </div>
    );
  }
}

export default TreeItemSelector;
