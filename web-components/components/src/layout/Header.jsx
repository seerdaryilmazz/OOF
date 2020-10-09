import React from 'react';
import { TranslatingComponent } from '../abstract/';
import { Button, DropDownButton } from '../basic';
import { Secure } from './';
import PropTypes from "prop-types";

export class PageHeader extends TranslatingComponent{

    render(){
        let icon="";
        if(this.props.icon){
            icon=this.props.icon;
        }
        let subtitle = "";
        if(this.props.subtitle){
            subtitle = <span className="sub-heading">{this.props.translate ? super.translate(this.props.subtitle) : this.props.subtitle}</span>;
        }
        return(
            <h3 className="heading_b uk-margin-bottom">
                {this.props.translate ? super.translate(this.props.title) : this.props.title}
                {icon}
                {subtitle}
            </h3>
            );

    }

}
PageHeader.contextTypes = {
    translator: PropTypes.object
};
export class CardSubHeader extends TranslatingComponent{

    render(){
        let toolbar = this.props.toolbar || [];
        return(
            <h3 className="full_width_in_card card-sub-header">
                {this.props.translate ? super.translate(this.props.title) : this.props.title}
                {
                    toolbar.map(item =>
                        <i key = {item.iconClass} style = {{float: "right", marginTop: "-5px"}} className={"md-icon-small " + item.iconClass}
                           title = {this.props.translate ? super.translate(item.title):item.title} data-uk-tooltip="{pos:'bottom'}" onClick = {() => item.onClick()} />)
                }
            </h3>
        );

    }

}
CardSubHeader.contextTypes = {
    translator: PropTypes.object
};
export class CardHeader extends TranslatingComponent{

    render(){
        return(
            <h3 className="full_width_in_card heading_c">
                {this.props.translate ? super.translate(this.props.title) : this.props.title}
            </h3>
        );

    }

}
CardHeader.contextTypes = {
    translator: PropTypes.object
};
export class HeaderWithBackground extends TranslatingComponent {

    triggerOnClickIfNecessary(onClickFunction) {
        if (onClickFunction) {
            onClickFunction();
        }
    }

    render() {

        let backgroundColor;

        if (this.props.backgroundColor) {
            backgroundColor = this.props.backgroundColor;
        } else {
            // Diğer renk seçenekleri için: http://altair_html.tzdthemes.com/components_colors.html
            backgroundColor = "md-bg-grey-200";
        }

        let className = "heading_c " + backgroundColor;

        let style = {
            padding: "10px 16px 10px 16px"
        };

        if (this.props.onClick) {
            style.cursor = "pointer";
        }

        let icon = null;

        if (this.props.icon) {
            let styleForIcon = {
                display: "inline",
                float: "right",
                verticalAlign: "middle",
                paddingLeft: "18px"
            };
            if (this.props.onIconClick) {
                styleForIcon.cursor = "pointer";
            }
            icon = (<i key={0} className={"uk-icon-medsmall uk-icon-" + this.props.icon} style={styleForIcon} onClick={() => this.triggerOnClickIfNecessary(this.props.onIconClick)}></i>);
        }

        let options = []
        if(icon){
            options.push(icon);
        }
        if(!_.isEmpty(this.props.options)){
            let styleForOption = {
                display: "inline",
                float: "right",
                verticalAlign: "middle"
            };
            this.props.options.forEach((option, i)=>{
                options.push(<i key={i+1} className="md-icon material-icons" style={styleForOption} onClick={() => this.triggerOnClickIfNecessary(option.onclick)}>{option.icon}</i>);
            })
        }

        let title;
        if (this.props.title && this.props.title.trim().length > 0) {
            title = this.props.translate ? super.translate(this.props.title) : this.props.title;
        } else {
            title = (<span>&nbsp;</span>)
        }

        return(
            <h3 className={className} style={style} onClick={() => this.triggerOnClickIfNecessary(this.props.onClick)}>
                {title}
                {options}
            </h3>
        );
    }
}
HeaderWithBackground.contextTypes = {
    translator: PropTypes.object
};

export class ActionHeader extends TranslatingComponent {
    static defaultProps = {
        backgroundColor: "md-bg-grey-200",
    };

    constructor(props) {
        super(props);
    }

    emptyOnClick() {
    }

    render() {
        let className = "full_width_in_card heading_c " + this.props.backgroundColor;

        if (this.props.removeTopMargin) {
            className += " uk-margin-top-remove";
        }

        let toolbar = [];
        if (!this.props.readOnly && !_.isEmpty(this.props.tools)) {
            this.props.tools.forEach(tool => {
                if (tool && !_.isEmpty(tool.items)) {
                    if (tool.items.length == 1) {
                        let item = tool.items[0];
                        toolbar.push(<Secure operations={this.props.operationName}>
                                        <Button label={tool.title} icon={tool.icon} flat={tool.flat} waves={true} style={tool.style ? tool.style : "primary"} size="mini" onclick={() => item.onclick()} />
                                    </Secure>);
                    } else {
                        toolbar.push(<Secure operations={this.props.operationName}>
                                        <DropDownButton label={tool.title} waves={true} style={tool.style ? tool.style : "primary"} size="mini" options={tool.items}
                                            minWidth={tool.minWidth ? tool.minWidth : "50px"} data_uk_dropdown={tool.data_uk_dropdown ? tool.data_uk_dropdown : ""} />);
                                    </Secure>);
                    }
                }
            })
        }
        return (
            <h3 className={className}>
                {super.translate(this.props.title)}
                {toolbar.map((tool, index) => <div key={index} className="uk-align-right">{tool}</div>)}
            </h3>
        );
    }
}
ActionHeader.contextTypes = {
    translator: PropTypes.object
};