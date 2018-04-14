import React, { Component } from 'react';
import { Progress,Container,Message } from 'semantic-ui-react';
import Upload from 'rc-upload';
import 'semantic-ui-css/semantic.min.css';
import '../App.css';

class UploadFile extends Component {

    state = { percent: 0 }

    progress = (step, file) => {
        let count = Math.round(step.percent);
        //console.log('onProgress', step, file.name);
        this.setState({percent: count});
    };

    uploadDone = (file) => {
        console.log(':: upload done: ', file);
        this.props.onFileData(file);
        this.setState({percent: 0})
    };

  render() {

      const props = {
          action: 'https://upload.kli.one/upload',
          type: 'drag',
          //accept: '.zip;.mp3',
          beforeUpload(file) {
              console.log('beforeUpload', file.name);
          },
          onStart(file) {
              console.log('onStart', file.name);
          },
          onError(err) {
              console.log('onError', err);
          },

      };

    return (
          <Container textAlign='center'>
          <Message>
          <Upload
              {...this.props}
              {...props}
              className={this.props.mode === "new" ? "insert" : "update"}
              onSuccess={this.uploadDone}
              onProgress={this.progress} >
              Drop file here or click me
          </Upload>
              <Progress label='' percent={this.state.percent} indicating progress='percent' />
          </Message>
          </Container>
    );
  }
}

export default UploadFile;
