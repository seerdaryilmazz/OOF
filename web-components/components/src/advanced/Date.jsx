import React from "react";
import _ from "lodash";
import uuid from "uuid";
import {TranslatingComponent} from "../abstract/";
import {RenderingComponent} from '../oneorder/RenderingComponent'
import {Grid, GridCell} from '../layout/Grid';
import PropTypes from "prop-types";

const DEFAULT_FORMAT = "DD/MM/YYYY";

export class Date extends TranslatingComponent {

    constructor(props) {

        super(props);

        this.state = {
            id: props.id ? props.id : uuid.v4(),
            internalValue: this.normalizeValue(props.value)
        };

        this.i18n = {
            "tr_TR" : {
                months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
                weekdays: ['Paz', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'],
            }
        };

        this.moment = require("moment");
    }

    componentDidMount() {

        this.initInputmask();

        $(this._input).on('hide.uk.datepicker', (e) => {
            let value = $(this._input).val();
            if (!_.isEqual(value, this.normalizeValue(this.props.value))) { // Gereksiz tetiklemeleri engellemek için...
                let format = this.getFormat();
                let moment = this.moment(value, format, true);
                if (moment.isValid()) {
                    this.handleOnChange(value);
                } else {
                    this.handleOnChange(this.normalizeValue(this.props.value)); // eski haline getiriyoruz
                }
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        let newInternalValue = this.normalizeValue(nextProps.value);
        if (!_.isEqual(this.state.internalValue, newInternalValue)) {
            this.setState({internalValue: newInternalValue});
        }
    }

    componentDidUpdate() {
        this.initInputmask();
    }

    normalizeValue(value) {
        if (_.isNil(value)) {
            return "";
        } else {
            return value;
        }
    }

    initInputmask() {

        let format = this.getFormat();
        let formatForInputmask = this.getFormatForInputMask(format);

        // Inputmask konfigürasyonu için https://github.com/RobinHerbots/Inputmask sayfasını gözden geçirmek lazım.
        $(this._input).inputmask({
            alias: formatForInputmask,
            showMaskOnHover: false,
            oncomplete: () => {
                let value = $(this._input).val();
                this.handleOnChange(value);
            },
            onincomplete: () => {
                let value = $(this._input).val();
                if (!_.isEqual(value, this.normalizeValue(this.props.value))) { // Gereksiz tetiklemeleri engellemek için...
                    this.handleOnChange(this.normalizeValue(this.props.value)); // eski haline getiriyoruz
                }
            },
            oncleared: () => {
                if (!_.isEqual("", this.normalizeValue(this.props.value))) { // Gereksiz tetiklemeleri engellemek için...
                    this.handleOnChange(""); // temizliyoruz
                }
            }
        });
    }

    /**
     * Datepicker'ın kullandığı formatlar için bu sayfayı inceleyiniz: https://getuikit.com/v2/docs/datepicker.html
     */
    getFormat() {
        if (this.props.format) {
            return this.props.format;
        } else {
            return DEFAULT_FORMAT;
        }
    }

    /**
     * Datepicker ve Inputmask farklı formatları kullandığından aşağıdaki gibi bir metoda ihtiyaç duyduk.
     * Inputmask'ın kullandığı formatlar için jquery.inputmask.bundle.js içindeki alias'ları inceleyiniz.
     */
    getFormatForInputMask(format) {
        return format.toLowerCase();
    }

    getDatepickerSettings() {

        let format = this.getFormat();
        let minDate = false;
        let maxDate = false;

        if (!_.isNil(this.props.minDate)) {
            minDate = this.props.minDate;
        }

        if (!_.isNil(this.props.maxDate)) {
            maxDate = this.props.maxDate;
        }

        // Aşağıda değişiklik yaparken https://getuikit.com/v2/docs/datepicker.html sayfasını gözden geçirmek lazım.
        let settings = {
            format: format,
            i18n: this.i18n[this.context.translator.locale],
            minDate: minDate,
            maxDate: maxDate
        };

        return JSON.stringify(settings);
    }

    handleOnChange(value) {
        if(this.props.required && value){
            $(this._input).parsley().validate();
        }
        if(this.props.onchange){
            this.props.onchange(value);
        }
    }

    handleOnChangeInternal(e) {
        let value = $(this._input).val();
        this.setState({internalValue: value});
    }

    renderStandard(){
        let value = this.state.internalValue;

        var style = {};
        if(this.props.hidden){
            style.display= 'none';
        }

        var wrapperClassName = "md-input-wrapper md-input-filled";

        var inputClassName = "md-input label-fixed";

        var label = super.translate(this.props.label);
        var requiredForLabel = "";
        if(this.props.required && label){
            requiredForLabel = <span className="req">*</span>;
        }

        let datepickerSettings = this.getDatepickerSettings();

        let component = <div className={wrapperClassName} style = {style}>
            <label htmlFor={this.state.id}>{label}{requiredForLabel}</label>
            <input ref={(c) => this._input = c}
                   className={inputClassName} type="text"
                   id={this.state.id}
                   onChange = {(e) => this.handleOnChangeInternal(e)}
                   required={this.props.required} value = {value}
                   data-uk-datepicker={datepickerSettings}/>
            <span className="md-input-bar "/>
        </div>;

        if(this.props.hideIcon){
            component = <div className="parsley-row">{component}</div>;
        }else{
            component = <div className="parsley-row"><div className="uk-input-group" style={style}>
                <span className="uk-input-group-addon"><i className="uk-input-group-icon uk-icon-calendar"/></span>
                {component}</div></div>;
        }

        return(component);
    }

    renderReadOnly() {

        let label = super.translate(this.props.label);

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-form-row">
                        <div className="md-input-wrapper md-input-filled">
                            <label>{label}</label>
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

Date.contextTypes = {
    translator: PropTypes.object,
};