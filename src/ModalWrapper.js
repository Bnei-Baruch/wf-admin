import React from 'react';
import { Modal } from 'semantic-ui-react';

import CIT from './CIT';

const ModalWrapper = props => (
  <Modal defaultOpen closeIcon="close">
    <Modal.Content>
      <CIT {...props} />
    </Modal.Content>
  </Modal>
);

export default ModalWrapper;
