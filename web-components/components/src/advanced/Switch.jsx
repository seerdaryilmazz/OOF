import PropTypes from "prop-types";
import React from 'react';
import uuid from 'uuid';
import { TranslatingComponent } from "../abstract/";

export class Switch extends TranslatingComponent {

    constructor(props) {
        super(props);
        if (props.id) {
            this.state = { id: props.id };
        } else {
            this.state = { id: uuid.v4() };
        }
    };

    color = {
        primary: '#1e88e5',
        danger: '#d32f2f',
        warning: '#ffb300',
        success: '#7cb342'
    };

    componentDidMount() {
        var this_size = $(this._input).attr('data-switchery-size');
        var this_color = $(this._input).attr('data-switchery-color');
        var this_secondary_color = $(this._input).attr('data-switchery-secondary-color');

        this.switchery = new Switchery(this._input, {
            disabled: this.props.disabled,
            color: (typeof this_color !== 'undefined') ? hex2rgba(this_color, 50) : hex2rgba('#009688', 50),
            jackColor: (typeof this_color !== 'undefined') ? hex2rgba(this_color, 100) : hex2rgba('#009688', 100),
            secondaryColor: (typeof this_secondary_color !== 'undefined') ? hex2rgba(this_secondary_color, 50) : 'rgba(0, 0, 0,0.26)',
            jackSecondaryColor: (typeof this_secondary_color !== 'undefined') ? hex2rgba(this_secondary_color, 50) : '#fafafa',
            className: 'switchery' + ((typeof this_size !== 'undefined') ? ' switchery-' + this_size : '')
        });

        this._input.onchange = () => {
            this.props.onChange && this.props.onChange(this._input.checked);
        };
    }

    render() {
        let input = <input id={this.state.id}
            ref={c => this._input = c}
            type="checkbox"
            className="switchery"
            data-switchery="true"
            data-switchery-size={this.props.size}
            data-switchery-color={this.color[this.props.style]}
            defaultChecked={this.props.value} />

        var label = <label htmlFor={this.state.id} className="inline-label">{this.props.translate ? super.translate(this.props.label) : this.props.label}</label>;
        var helpText = <span className="uk-form-help-block">{this.props.translate ? super.translate(this.props.helpText) : this.props.helpText}</span>
        return (
            <div className="checkbox-margin">
                {input}
                {label}
                {helpText}
            </div>
        );
    }
}

Switch.contextTypes = {
    translator: PropTypes.object
};