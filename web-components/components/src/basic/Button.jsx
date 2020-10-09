import React from 'react';
import PropTypes from 'prop-types';
import {TranslatingComponent} from '../abstract/'
import uuid from 'uuid';
import _ from "lodash";

export class Button extends TranslatingComponent{
    constructor(props){
        super(props);
        this.clickTime = 0;
        this.clickCooldown = 1000;
    };
    componentDidMount(){
        $(this._input).on('click',(event)=> {
            let time = new Date().getTime();
            let allowClickAfter = this.clickTime + this.clickCooldown;
            if (this.props.onclick && (this.props.disableCooldown || time > allowClickAfter)) {
                this.props.onclick(event);
                this.clickTime = time;
            }
        });
    }
    render(){
        var className = "md-btn md-btn-wave waves-effect waves-button";
        if(this.props.flat){
            className += " md-btn-flat"
        }
        if(this.props.icon){
            className += " md-btn-icon";
        }
        if(this.props.style){
            className += (this.props.flat ? (" md-btn-flat-" + this.props.style) : (" md-btn-" + this.props.style));
        }
        if(this.props.textColor){
            className = className + " " + this.props.textColor;
        }
        if(this.props.size){
            className += (" md-btn-" + this.props.size);
        }
        if(this.props.disabled){
            className += " disabled";
        }
        if(this.props.active){
            className += " uk-active";
        }
        if (this.props.float) {
            className += (" uk-float-" + this.props.float);
        }
        if (this.props.fullWidth) {
            className += " md-btn-block";
        }
        var icon;
        if(this.props.icon || this.props.mdIcon){
            let iconClassName;
            if(this.props.icon){
                iconClassName = "uk-icon-medsmall uk-icon-" + this.props.icon;
            } else if(this.props.mdIcon){
                iconClassName = "material-icons";
            }

            if(this.props.iconColorClass){
                iconClassName = iconClassName + " " + this.props.iconColorClass;
            }
            let noMarginRight = this.props.label ? {} : {marginRight: "0px"};
            let tooltip = this.props.tooltip ? super.translate(this.props.tooltip) : null;
            icon = <i className={iconClassName} style = {noMarginRight} title={tooltip} data-uk-tooltip="{pos:'bottom'}">{this.props.mdIcon}</i>;
        }
        var type = this.props.type;
        if(!type){
            type = "button";
        }

        let labelWrapper;
        if (this.props.label) {
            if (_.isString(this.props.label)) {
                labelWrapper = <span style={this.props.labelStyle}>{super.translate(this.props.label)}</span>
            } else if (_.isArray(this.props.label)) { // multiple line label
                if (this.props.label.length == 1) {
                    labelWrapper = super.translate(this.props.label[0]);
                } else if (this.props.label.length > 1) {
                    labelWrapper = (
                        <div>
                            {
                                this.props.label.map((item, index) => {
                                    return (
                                        <div key={"div-for-label-" + index} style={this.props.labelStyle}>{super.translate(item)}</div>
                                    );
                                })
                            }
                        </div>
                    );
                }
            }
        }

        let id = this.props.id ? this.props.id : uuid.v4();

        return(
            <button id={id} ref={(c) => this._input = c} className={className} type={type}>
                {icon}
                {labelWrapper}
            </button>

        );
    }
}
Button.contextTypes = {
    translator: PropTypes.object
};