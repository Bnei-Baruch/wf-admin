import React from 'react';
import PropTypes from 'prop-types';
import { Input, Table } from 'semantic-ui-react';

const FileNamesWidget = (props) => {
  const { auto_name: autoName, manual_name: manualName, onChange } = props;

  return (
    <Table celled>
      <Table.Body>
        <Table.Row>
          <Table.Cell collapsing>File Name</Table.Cell>
          <Table.Cell>{autoName}</Table.Cell>
        </Table.Row>
        {/*<Table.Row>*/}
        {/*  <Table.Cell>*/}
        {/*    Manual*/}
        {/*  </Table.Cell>*/}
        {/*  <Table.Cell style={{ padding: '0' }}>*/}
        {/*    <Input*/}
        {/*      fluid*/}
        {/*      size="small"*/}
        {/*      placeholder="..."*/}
        {/*      className="bb-manual-name-input"*/}
        {/*      value={manualName || ''}*/}
        {/*      focus={!!manualName && manualName !== autoName}*/}
        {/*      onChange={onChange}*/}
        {/*    />*/}
        {/*  </Table.Cell>*/}
        {/*</Table.Row>*/}
        {/*<Table.Row>*/}
        {/*  <Table.Cell>Final</Table.Cell>*/}
        {/*  <Table.Cell>{manualName || autoName}</Table.Cell>*/}
        {/*</Table.Row>*/}
      </Table.Body>
    </Table>
  );
};

FileNamesWidget.propTypes = {
  onChange: PropTypes.func.isRequired,
  auto_name: PropTypes.string,
  manual_name: PropTypes.string,
};

FileNamesWidget.defaultProps = {
  auto_name: '',
  manual_name: '',
};

export default FileNamesWidget;
