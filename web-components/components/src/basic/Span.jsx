import React from 'react';
import PropTypes from 'prop-types';
import {TranslatingComponent} from '../abstract/'


export class Span extends TranslatingComponent{

    static defaultProps = { tooltip: {} };

    constructor(props){
        super(props);
    }

    renderAsLinkOrNormal(className, value) {
        let { tooltip } = this.props;
        let style = { padding: "12px 4px", display: "block" };
        if (this.props.onclick) {
            return <a className={className} style={style}
                data-uk-tooltip={`{pos:'${tooltip.position || 'top'}'}`}
                title={tooltip.title}
                href="javascript:;" onClick={this.props.onclick}>{value}</a>;
        } else {
            return <span className={className} style={style}
                data-uk-tooltip={`{pos:'${tooltip.position || 'top'}'}`}
                title={tooltip.title}>{value}</span>;
        }
    }

    render(){
        var label = "";
        if(!this.props.hideLabel){
            label = super.translate(this.props.label);
        }
        let value = this.props.translate ? super.translate(this.props.value) : this.props.value;
        let className = "";
        if(this.props.uppercase){
            className += " uk-text-upper";
        }
        if(this.props.bold){
            className += " uk-text-bold";
        }
        if(this.props.textStyle){
            className += ` uk-text-${this.props.textStyle}`;
        }

        let helperComponent = "";
        if(this.props.helperText){
            helperComponent = <span className="uk-form-help-block">{this.props.helperText}</span>;
        }

        return(
            <div className="uk-form-row">
                <div className="md-input-wrapper md-input-filled" >
                    <label>{label}</label>
                    {this.renderAsLinkOrNormal(className, value)}
                </div>
                {helperComponent}
            </div>
        );
    }
}
Span.contextTypes = {
    translator: PropTypes.object
};