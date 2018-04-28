import React, {Component, Fragment} from 'react'
import LangSelector from "../../components/LangSelector";
import LangCheck from "./LangCheck";

class CarbonApp extends Component {

    state = {
        conv_state: {},
    };

    convState = (state) => {
        this.setState({conv_state: state});
        this.LangSelector.updateLangs(state);
    };

    setLangs = (langs) => {
        console.log(":: Got langs: ",langs);
    };

    render() {

        return (
            <Fragment>
                <LangSelector onRef={ref => (this.LangSelector = ref)} onGetLangs={this.setLangs} />
                <LangCheck carbon={this.state.carbon} onLangState={this.convState} />
            </Fragment>
        );
    }
}

export default CarbonApp;