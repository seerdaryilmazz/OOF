import React from 'react';
import { HSCodeExtendedAutoComplete } from './common/HSCodeExtendedAutoComplete';

export class Test extends React.Component {
    state = { value: null }
    onChange(value) {
        console.log("value", value);
        this.setState({ value: value });
    }
    render() {
        return <HSCodeExtendedAutoComplete value={this.state.value} onChange={(value) => this.onChange(value)}></HSCodeExtendedAutoComplete>;
    }
}