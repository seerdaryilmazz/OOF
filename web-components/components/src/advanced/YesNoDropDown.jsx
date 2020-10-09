import React from 'react';
import {DropDown} from '../basic';

export class YesNoDropDown extends React.Component {

    constructor(props) {
        super(props);
        let positiveLabel = "Yes";
        let negativeLabel = "No";
        this.options = [
            {
                id: 1,
                name: props.positiveLabel ? props.positiveLabel : positiveLabel
            },
            {
                id: 2,
                name: props.negativeLabel ? props.negativeLabel : negativeLabel
            }
        ];
    }

    handleOnChange(val) {
        if (this.props.onchange) {
            let valueToBeSent = null;
            if (val != null) {
                if (val.id == 1) {
                    valueToBeSent = true;
                } else {
                    valueToBeSent = false;
                }
            }
            this.props.onchange(valueToBeSent);
        }
    }

    render() {

        let value = null;

        if (this.props.value === true) {
            value = this.options[0];
        } else if (this.props.value === false) {
            value = this.options[1];
        }

        return (
            <DropDown label={this.props.label}
                      options={this.options}
                      value={value}
                      onchange={(val) => this.handleOnChange(val)}
                      required={this.props.required} />
        );
    }
}

