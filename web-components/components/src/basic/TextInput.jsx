import React from "react";
import PropTypes from 'prop-types';
import uuid from "uuid";
import _ from "lodash";
import {Grid, GridCell} from "../layout/Grid";
import {TranslatingComponent} from "../abstract/";
import {RenderingComponent} from "../oneorder/RenderingComponent";

export class TextInput extends TranslatingComponent{
    constructor(props){
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
    };

    componentDidMount(){
        $(this._input).on('focus', function() {
            $(this).closest('.md-input-wrapper').addClass('md-input-focus');
        });
        $(this._input).on('blur', (e) => {
            $(e.target).closest('.md-input-wrapper').removeClass('md-input-focus');
            this.handleOnBlur(e);
        });
        
        if (this.props.mask) {
            $(this._input).inputmask();
            $(this._input).on('change', (e) => {
                this.handleOnChange(e);
            });
            $(this._input).on('input', (e) => {
                this.handleOnInput(e);
            });
        }
    }
    componentDidUpdate(prevProps){
        if(this.context.validation) {
            this.context.validation.cleanPreviousCustomValidationErrors(this._input);
            if (this.props.errors) {
                this.context.validation.addCustomValidationErrors(this._input, this.props.errors);
            }
        }
        if(prevProps.readOnly && !this.props.readOnly && this.props.mask){
            $(this._input).inputmask();
            $(this._input).on('change', (e) => {
                this.handleOnChange(e);
            });
            $(this._input).on('input', (e) => {
                this.handleOnInput(e);
            });
        }
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.errors) {
            this.context.validation.addCustomValidationErrors(this._input, nextProps.errors);
        }
    }
    
    handleOnChange(event){
        if(this.props.onchange){
            let value = event.target.value;
            if(this.props.uppercase){
                let locale = this.props.uppercase.locale || "en";
                value = value.toLocaleUpperCase(locale);
            }
            this.props.onchange(value);
        }
    }

    handleOnInput(event){
        if(this.props.oninput){
            let value = event.target.value;
            if(this.props.uppercase){
                let locale = this.props.uppercase.locale || "en";
                value = value.toLocaleUpperCase(locale);
            }
            this.props.oninput(value);
        }
    }

    handleOnBlur(event){
        if(this.props.onblur){
            this.props.onblur(event.target.value);
        }
    }

    createInlineButton(key, style, label, icon, onClickFunction) {

        let inlineButton;
        let buttonStyle = "primary";

        if (style) {
            buttonStyle = style;
        }

        let styleClassName = "md-btn-flat-" + buttonStyle;
        let iconComponent = null;

        if (icon) {
            iconComponent = (<i className={"uk-icon-medsmall uk-icon-" + icon}></i>);
        }

        let space = null;

        if (icon && label) {
            space = (<span>&nbsp;</span>);
        }

        inlineButton = (
            <a key={key}
               href=""
               onClick={(e) => {e.preventDefault(); onClickFunction()}}
               className={"md-btn md-btn-flat md-btn-mini " + styleClassName}>{iconComponent}{space}{label}</a>
        );

        return inlineButton;
    }

    wrapInlineButtons(inlineButtons) {
        return (
            <span className="uk-form-password-toggle">{inlineButtons}</span>
        );
    }

    renderStandard(){
        let hidden = this.props.hidden;
        let style = this.props.style || {};
        if(hidden){
            style.display = 'none';
        }
        
        let value = "";
        if(this.props.value || _.isNumber(this.props.value)){
            value = this.props.value;
        }

        var wrapperClassName = "md-input-wrapper";
        if(value !== "" || this.props.placeholder || this.props.labelAlwaysRaised === true){
            wrapperClassName += " md-input-filled";
        }
        var inputClassName = "md-input";
        if(value !== "" || this.props.placeholder){
            inputClassName += " label-fixed";
        }
        if(this.props.danger){
            inputClassName += " md-input-danger";
            wrapperClassName += " md-input-wrapper-danger";
        }
        let inputMaskSettings = "";
        if(this.props.mask){
            inputClassName += " masked_input";
            inputMaskSettings = this.props.mask;
        }
        let inputBarClassName = "md-input-bar";
        if(this.props.size){
            inputClassName += " uk-form-width-" + this.props.size;
            inputBarClassName += " uk-form-width-" + this.props.size;
        }
        var label = "";
        if(!this.props.hideLabel){
            label = super.translate(this.props.label);
        }
        var requiredForLabel = "";
        if(this.props.required && label){
            requiredForLabel = <span className="req">*</span>;
        }
        if(this.props.disabled){
            wrapperClassName +=" md-input-wrapper-disabled";
        }
        let rowClassName = "uk-form-row parsley-row";
        let addon = "";
        if(this.props.ukIcon){
            rowClassName += " uk-input-group";
            addon = <span className="uk-input-group-addon"><i className={"uk-input-group-icon uk-icon-" + this.props.ukIcon}/></span>;
        } else if(this.props.mdIcon){
            rowClassName += " uk-input-group";
            addon = <span className="uk-input-group-addon"><i className="material-icons md-24">{this.props.mdIcon}</i></span>;
        } else if(this.props.mdiIcon){
            rowClassName += " uk-input-group";
            addon = <span className="uk-input-group-addon"><i className= {"mdi mdi-24px mdi-" + this.props.mdiIcon}/></span>;
        }

        let inlineButton = null;
        if (this.props.button) {
            let actualButton = this.createInlineButton(uuid.v4(), this.props.button.style, this.props.button.label, this.props.button.icon, this.props.button.onclick);
            inlineButton = this.wrapInlineButtons([actualButton]);
        }

        let inlineButtons = null;
        if (this.props.buttons) {
            let actualButtons = [];
            this.props.buttons.forEach((button) => {
                actualButtons.push(this.createInlineButton(uuid.v4(), button.style, button.label, button.icon, button.onclick));
            });
            inlineButtons = this.wrapInlineButtons(actualButtons);
        }

        let unit = null;
        if(this.props.unit){
            unit = <span className="uk-badge uk-badge-outline textinput-unit">{this.props.unit}</span>
        }

        let inputType = "text";
        if (this.props.password) {
            inputType = "password";
        }

        let helperComponent = "";
        if(this.props.helperText){
            helperComponent = <span className="uk-form-help-block">{this.props.helperText}</span>;
        }


        if(this.props.unit){
            style.paddingRight = ((this.props.unit.length * 8) + 8 + 2) + "px";
        }

        let autocomplete = undefined;
        if(this.props.disableAutocomplete) {
            autocomplete = "no";
        }

        let labelClassName = "";
        if (this.props.noWrapLabel === true) {
            labelClassName = "uk-text-nowrap";
        }

        return(
            <div className={rowClassName}>
                {addon}
                <div className={wrapperClassName} >
                    <label className={labelClassName}>{label}{requiredForLabel}</label>
                    <input ref = {(c) => this._input = c}
                           id = {this.state.id}
                           type = {inputType}
                           className = {inputClassName}
                           style = {style}
                           value = {value}
                           onChange = {(e) => this.handleOnChange(e)}
                           onInput = {(e) => this.handleOnInput(e)}
                           placeholder = {super.translate(this.props.placeholder)}
                           required = {this.props.required}
                           disabled = {this.props.disabled}
                           maxLength = {this.props.maxLength}
                           data-inputmask = {inputMaskSettings}
                           data-inputmask-showmaskonhover = {false}
                           data-parsley-group = {this.props.validationGroup}
                           data-parsley-required-message = {super.translate("This value is required.")}
                           autoComplete={autocomplete}
                    />
                    {inlineButton}
                    {inlineButtons}
                    {unit}
                    <span className={inputBarClassName}/>
                </div>
                {helperComponent}
            </div>
        );
    }

    renderReadOnly(){
        var selectedValue = "";

        var label = "";
        if(!this.props.hideLabel){
            label = super.translate(this.props.label);
        }

        let labelClassName = "";
        if (this.props.noWrapLabel === true) {
            labelClassName = "uk-text-nowrap";
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-form-row">
                        <div className="md-input-wrapper md-input-filled">
                            <label className={labelClassName}>{label}</label>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <span className="uk-text-padding">{this.props.value}</span>
                </GridCell>
            </Grid>
        );
    }
    render() {
        return RenderingComponent.render(this);
    }
}
TextInput.contextTypes = {
    translator: PropTypes.object,
    validation: PropTypes.object
};