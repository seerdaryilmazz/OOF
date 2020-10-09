import PropTypes from 'prop-types';
import React from 'react';
import uuid from 'uuid';
import { TranslatingComponent } from '../abstract/';
import { withReadOnly } from "../abstract/withReadOnly";
import { Grid, GridCell } from '../layout';
import { RenderingComponent } from '../oneorder/RenderingComponent';

var handleAutoSize = null; 
export class TextArea extends TranslatingComponent {
    constructor(props) {
        super(props);
        if (props.id) {
            this.state = { id: props.id };
        } else {
            this.state = { id: uuid.v4() };
        }
        handleAutoSize = destroy=>this.handleAutoSize(destroy);
    };
    componentDidMount() {
        let { autosizeOnFocus } = this.props;
        $(this._input).on('focus', function () {
            $(this).closest('.md-input-wrapper').addClass('md-input-focus');
            autosizeOnFocus && handleAutoSize();
        });
        $(this._input).on('blur', function () {
            $(this).closest('.md-input-wrapper').removeClass('md-input-focus');
            autosizeOnFocus && handleAutoSize(true);
        });
        !autosizeOnFocus && this.handleAutoSize();
    }
    handleOnChange(event) {
        if (this.props.onchange) {
            this.props.onchange(event.target.value);
        }
    }

    handleAutoSize(destroy){
        $textarea = $(this._input).not(".no_autosize");
        $textarea.hasClass("autosized") && autosize.destroy($textarea);
        if(!destroy){
            autosize($textarea);
            $textarea.addClass("autosized");
        }
    }

    renderStandard() {
        var cols = this.props.cols;
        if (!cols) {
            cols = "30";
        }
        var rows = this.props.rows;
        if (!rows) {
            rows = "4";
        }
        var hidden = this.props.hidden;
        var style = this.props.style || {};
        if (hidden) {
            style.display = 'none';
        }
        var wrapperClassName = "md-input-wrapper";
        if (this.props.value || this.props.placeholder) {
            wrapperClassName += " md-input-filled";
        }
        var inputClassName = "md-input";
        if (this.props.noAutoSize === true) {
            inputClassName += " no_autosize";
        }
        if (this.props.value || this.props.placeholder) {
            inputClassName += " label-fixed";
        }

        var label = "";
        if (!this.props.hideLabel) {
            label = super.translate(this.props.label);
        }
        var requiredForLabel = "";
        if (this.props.required && label) {
            requiredForLabel = <span className="req">*</span>;
        }
        if (this.props.disabled) {
            wrapperClassName += " md-input-wrapper-disabled";
        }

        let value = "";
        if (this.props.value) {
            value = this.props.value;
        }

        return (
            <div className="uk-form-row parsley-row">
                <div className={wrapperClassName} >
                    <label>{label}{requiredForLabel}</label>
                    <textarea id={this.state.id}
                        ref={(c) => this._input = c}
                        cols={cols} rows={rows}
                        maxLength={this.props.maxLength}
                        className={inputClassName}
                        value={value}
                        placeholder={this.props.placeholder}
                        required={this.props.required}
                        disabled={this.props.disabled}
                        onChange={(e) => this.handleOnChange(e)}
                        style={style}
                    />
                    <span className="md-input-bar" />
                </div>
            </div>
        );
    }

    renderReadOnly() {
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
                            <label className={labelClassName}>{super.translate(label)}</label>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <div style={{ overflow: "hidden", whiteSpace: "pre-wrap", textAlign: "justify" }}>
                        {this.props.value}
                    </div>
                </GridCell>
            </Grid>
        );
    }
    
    render(){
        return RenderingComponent.render(this);
    }
}
TextArea.contextTypes = {
    translator: PropTypes.object
};

export const ReadOnlyTextArea = withReadOnly(TextArea);