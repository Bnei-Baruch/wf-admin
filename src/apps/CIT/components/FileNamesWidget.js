import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Input, Popup, Table } from 'semantic-ui-react';

const FileNamesWidget = (props) => {
  const { auto_name: autoName, manual_name: manualName, onChange } = props;

  return (
    <Table celled>
      <Table.Body>
        <Table.Row>
          <Table.Cell collapsing>שם אוטומטי</Table.Cell>
          <Table.Cell style={{ direction: 'ltr' }}>{autoName}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            שם ידני
            &nbsp;&nbsp;
            <Popup
              trigger={<Icon name="help circle outline" color="teal" />}
              position="top right"
              style={{ direction: 'rtl', textAlign: 'right' }}
              header="שם ידני"
              content="לשם הקובץ אין השפעה על המערכת, הוא ניתן אך ורק לצורכי תצוגה."
            />
          </Table.Cell>
          <Table.Cell style={{ padding: '0', direction: 'ltr' }}>
            <Input
              fluid
              size="small"
              placeholder="שנה שם אוטומטי"
              className="bb-manual-name-input"
              value={manualName || ''}
              focus={!!manualName && manualName !== autoName}
              onChange={onChange}
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>שם סופי</Table.Cell>
          <Table.Cell style={{ direction: 'ltr' }}>{manualName || autoName}</Table.Cell>
        </Table.Row>
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
