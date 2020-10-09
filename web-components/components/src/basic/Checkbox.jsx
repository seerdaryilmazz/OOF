import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import {TranslatingComponent} from '../abstract/'

export class Checkbox extends TranslatingComponent {
    constructor(props) {
        super(props);
        if (props.id) {
            this.state = {id: props.id};
        } else {
            this.state = {id: uuid.v4()};
        }
    };

    loadiCheck(){
        $(this._input).iCheck({
            checkboxClass: 'icheckbox_md',
            increaseArea: '20%'
        });
        $(this._input).on('ifChanged', (e) => {
            this.ifChanged(e);
        });
    }

    componentDidMount() {
        this.loadiCheck();
    };

    componentWillUnmount(){
        this.unloadiCheck();
    }

    unloadiCheck(){
        $(this._input).iCheck('destroy');
    }

    componentDidUpdate(prevProps, prevState){
        $(this._input).iCheck('update');
    }

    ifChanged(event) {
        if (this.props.required) {
            $(this._input).parsley().validate();
        }
        if (this.props.onchange) {

            this.props.onchange(event.target.checked);
        }
    };

    render() {
        var minRequired = 0;
        var maxRequired = 0;
        var validateName = "";
        if (this.props.required) {
            if (this.props.minRequired) {
                minRequired = this.props.minRequired;
            }
            if (this.props.maxRequired) {
                maxRequired = this.props.maxRequired;
            }
            if (minRequired > 0) {
                validateName = this.props.name;
            }
        }
        let propValue = this.props.checked ? this.props.checked : this.props.value;
        let value = !!(propValue && propValue !== "false");

        var input = <input ref={(c) => this._input = c}
                           data-parsley-mincheck={{min: minRequired, max: maxRequired}} required={this.props.required}
                           data-parsley-multiple={validateName}
                           type="checkbox" id={this.state.id} name={this.props.name}
                           disabled = {this.props.disabled}
                           readOnly={true}
                           data-md-icheck checked={value}
                           data-parsley-required-message = {super.translate("This value is required.")}/>;
        var label = <label htmlFor={this.state.id} className="inline-label">{super.translate(this.props.label)}</label>;
        if (this.props.inline) {
            let className = "icheck-inline";
            if (this.props.noMargin === true) {
                className += " uk-margin-remove";
            }
            return (
                <span className={className}>
                    {input}
                    {label}
                </span>
            );
        } else {
            return (
                <div className="checkbox-margin">
                    {input}
                    {label}
                </div>
            );
        }

    }
}
Checkbox.contextTypes = {
    translator: PropTypes.object
};