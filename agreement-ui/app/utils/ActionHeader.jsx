import React from "react";
import PropTypes from "prop-types";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDownButton } from 'susam-components/basic';
import uuid from "uuid";
import { withAuthorization } from "../utils";

export class ActionHeader extends TranslatingComponent {

    constructor(props) {
        super(props);
    }

    emptyOnClick() {
    }

    render() {

        const SecuredDropDownButton = withAuthorization(DropDownButton, this.props.operationName, {hideWhenNotAuthorized: true});
        const SecuredButton = withAuthorization(Button, this.props.operationName, {hideWhenNotAuthorized: true});

        let backgroundColor = this.props.backgroundColor ? this.props.backgroundColor : "md-bg-grey-200";

        let className = "full_width_in_card heading_c" + backgroundColor;

        if (this.props.removeTopMargin) {
            className = className + " uk-margin-top-remove";
        }

        let toolbar = [];
        if(!this.props.readOnly && !_.isEmpty(this.props.tools)){
            this.props.tools.map(tool => {
                if(tool && !_.isEmpty(tool.items)){
                    if(tool.items.length == 1){
                        let item = tool.items[0];
                        toolbar.push(<SecuredButton label={tool.title} icon={tool.icon} flat={tool.flat} waves={true} style={tool.style ? tool.style : "primary"} size="small" onclick = {()=>item.onclick()}/>);
                    }else{
                        toolbar.push(<SecuredDropDownButton label={tool.title} waves={true} style={tool.style ? tool.style : "primary"} size="small" options={tool.items}
                                                            minWidth={tool.minWidth ? tool.minWidth : "50px"} data_uk_dropdown={tool.data_uk_dropdown ? tool.data_uk_dropdown : ""}/>);
                    }
                }
            })
        }
        return(
            <h3 className={className}>
                {super.translate(this.props.title)}
                {toolbar.map(tool => <div key={uuid.v4()} className="uk-align-right">{tool}</div>)}
            </h3>
        );
    }
}
ActionHeader.contextTypes = {
    translator: PropTypes.object
};
