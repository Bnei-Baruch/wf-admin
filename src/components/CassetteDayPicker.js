import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DayPickerInput, { defaultParse as parseDate } from 'react-day-picker/DayPickerInput';
import { Checkbox, Form } from 'semantic-ui-react';

import { DATE_FORMAT } from '../shared/consts';
import { formatDate, today } from '../shared/utils';

class CassetteDayPicker extends PureComponent {

  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
  };

  static defaultProps= {
    defaultValue: null,
  };

  state = {
    selectedDay: this.props.defaultValue || today(),
    isUnknown: false,
  };

  handleDateChange = (date) => {
    const value = date ? formatDate(date) : '1970-01-01';
    this.setState({
      selectedDay: value,
      isUnknown: false,
    });
    this.props.onSelect(value);
  };

  handleUnknownChange = (e, data) => {
    const value = data.checked ? '1970-01-01' : formatDate(new Date());
    this.setState({
      selectedDay: value,
      isUnknown: data.checked,
    });
    this.props.onSelect(value);
  };

  render() {
    const { selectedDay, isUnknown } = this.state;

    return (
      <Form>
        <Form.Field>
          <DayPickerInput
            placeholder={DATE_FORMAT}
            format={DATE_FORMAT}
            value={selectedDay}
            formatDate={formatDate}
            onDayChange={this.handleDateChange}
            dayPickerProps={{ firstDayOfWeek: 0, month: parseDate(selectedDay) }}
            style={{ width: '100%', zIndex: 1000 }}
          />
        </Form.Field>
        <Checkbox
          label="לא ידוע"
          checked={isUnknown}
          onChange={this.handleUnknownChange}
        />
      </Form>
    );
  }
}

export default CassetteDayPicker;
