import React from 'react';
import PropTypes from 'prop-types';
import {TranslatingComponent} from '../abstract/';
import {ToolbarItems} from '../oneorder/layout';

export class Card extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {};
    };

    componentDidMount(){

    };

    handleToolbarClick(toolbarItem, event){
        event.preventDefault();
        toolbarItem.action();
    }

    render() {
        let toolbar = "";
        let title = "";
        if(this.props.toolbarItems){
            toolbar = <div className="md-card-toolbar">
                <ToolbarItems actions = {this.props.toolbarItems} />
                        <h3 className="md-card-toolbar-heading-text" style = {{fontSize:"14px"}}>
                            {super.translate(this.props.title)}
                        </h3>
                      </div>;
        }else{
            title = <h3 className="heading_a" style = {{fontSize:"14px"}}>{super.translate(this.props.title)}</h3>;
        }
        let className = "md-card";
        if(this.props.className){
            className += " " + this.props.className;
        }
        let contentClassName =["md-card-content"];
        if(this.props.zeroPadding){
            contentClassName.push("uk-padding-remove");
        }
        return (
            <div className={className} style={this.props.style}>
                {toolbar}
                <div className={contentClassName.join(" ")}>
                    {title}
                    {this.props.children}
                </div>
            </div>
        );
    };
}
Card.contextTypes = {
    translator: PropTypes.object
};