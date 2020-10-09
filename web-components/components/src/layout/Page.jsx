import React from 'react';
import {TranslatingComponent} from '../abstract/'
import {ToolbarItems} from '../oneorder/layout';

export class Page extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {};
    };

    handleToolbarClick(toolbarItem, event){
        event.preventDefault();
        toolbarItem.action();
    }

    render() {

        let className = "md-card";
        if(this.props.className){
            className += " " + this.props.className;
        }
        return (
            <div className={className}>
                <div className="uk-grid uk-grid-collapse">

                    <div className="uk-width-medium-1-1">
                        <div className="md-card-toolbar hidden-print">
                            <ToolbarItems actions = {this.props.toolbarItems} />
                            <div className="md-card-toolbar-sub-title">
                                {super.translate(this.props.title)}
                            </div>
                        </div>
                    </div>

                    <div className="uk-width-medium-1-1">
                        <div className="md-card-toolbar-sub-title-small-only">
                            {super.translate(this.props.title)}
                        </div>
                    </div>

                </div>
                <div className="md-card-content">
                    {this.props.children}
                </div>
            </div>
        );
    };
}
Page.contextTypes = {
    translator: React.PropTypes.object
};