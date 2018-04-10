import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'semantic-ui-react';

import { EMPTY_ARRAY } from '../shared/consts';
import { SourcesTree } from '../shared/shapes';
import SourcesSearch from './SourcesSearch';
import TreeItemSelector from './TreeItemSelector';

class SourceSelector extends PureComponent {

  static propTypes = {
    tree: SourcesTree,
    onSelect: PropTypes.func.isRequired
  };

  static defaultProps = {
    tree: EMPTY_ARRAY,
  };

  state = {
    isSearch: true,
  };

  handleSearch = () => this.setState({ isSearch: true });
  handleBrowse = () => this.setState({ isSearch: false });

  render() {
    const { tree, onSelect } = this.props;
    const { isSearch }       = this.state;

    return (
      <Table basic="very" size="small">
        <Table.Body>
          <Table.Row>
            <Table.Cell collapsing>
              <Button.Group basic>
                <Button icon="search" active={isSearch} onClick={this.handleSearch} />
                <Button icon="browser" active={!isSearch} onClick={this.handleBrowse} />
              </Button.Group>
            </Table.Cell>
            <Table.Cell>
              {
                isSearch ?
                  <SourcesSearch tree={tree} onSelect={onSelect} /> :
                  <TreeItemSelector tree={tree} onSelect={onSelect} />
              }
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }
}

export default SourceSelector;
