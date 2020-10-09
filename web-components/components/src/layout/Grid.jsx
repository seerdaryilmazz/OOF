import React from 'react';
import uuid from 'uuid';

export class Grid extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
    };

    componentDidMount(){

    };

    render() {
        let className = "uk-grid";
        let matchOptions = "";
        if(this.props.gridMargin){
            className = className + " uk-grid-margin";
        }else{
            className = className + " uk-row-first";
        }
        if(this.props.collapse){
            className = className + " uk-grid-collapse";
        }
        if(this.props.divider){
            className = className + " uk-grid-divider";
        }
        if (this.props.removeTopMargin) {
            className = className + " uk-margin-top-remove";
        }
        if(this.props.hidden){
            className = className + " uk-hidden";
        }
        if(this.props.gridMatch){
            className = className + " uk-grid-match";
            matchOptions = "{target:'.md-card'}";
        }
        if(this.props.overflow){
            className = className + " uk-overflow-container";
        }
        if(this.props.smallGutter){
            className = className + " uk-grid-small";
        }

        return (
            <div className={className} style = {this.props.style} data-uk-grid-match = {matchOptions}>
                {this.props.children}
            </div>
        );
    };

}

export class GridCell extends React.Component{
    constructor(props){
        super(props);
        var id = this.props.id ? this.props.id : uuid.v4();
        this.state = {id: id};
    };

    componentDidMount(){

    };

    render() {
        var className = [];

        if(this.props.width){
            className.push("uk-width-medium-" + this.props.width);
        } else if(this.props.widthSmall){
            className.push("uk-width-small-" + this.props.widthSmall);
        } else if(this.props.widthLarge){
            className.push("uk-width-large-" + this.props.widthLarge);
        } else {
            className.push("uk-width-medium-1-1");
        }

        if(!this.props.noMargin){
            if(this.props.margin){
                className.push("uk-margin-" + this.props.margin);
            }
            else{
                className.push("uk-grid-margin");
            }

        }
        if(this.props.hidden){
            className.push("uk-hidden");
        }

        if(this.props.center){
            className.push("uk-container-center");
        }
        if(this.props.textCenter){
            className.push("uk-text-center");
        }


        let children = this.props.children;
        if(this.props.verticalAlign){
            children = <div className={"uk-vertical-align-" + this.props.verticalAlign}>{this.props.children}</div>;
            className.push("uk-vertical-align");
        }
        return (
            <div className={className.join(" ")} id={this.state.id} style = {this.props.style}>
                {children}
            </div>
        );

    };

}
