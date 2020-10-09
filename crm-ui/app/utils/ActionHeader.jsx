import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDownButton } from 'susam-components/basic';
import { Secure } from "susam-components/layout";

export class ActionHeader extends TranslatingComponent {

    constructor(props) {
        super(props);
    }

    emptyOnClick() {
    }

    render() {
        let backgroundColor = this.props.backgroundColor ? this.props.backgroundColor : "md-bg-grey-200";

        let className = "full_width_in_card heading_c" + backgroundColor;

        if (this.props.removeTopMargin) {
            className = className + " uk-margin-top-remove";
        }

        if (this.props.className) {
            className += " " + this.props.className;
        }

        let toolbar = [];
        if (!this.props.readOnly && !_.isEmpty(this.props.tools)) {
            this.props.tools.forEach(tool => {
                let toolReadOnly = _.isNil(tool.readOnly) ? false : tool.readOnly;
                if (tool && !_.isEmpty(tool.items) && !toolReadOnly ) {
                    if (tool.items.length == 1) {
                        let item = tool.items[0];
                        toolbar.push(<Secure operations={this.props.operationName}>
                            <Button label={tool.title} icon={tool.icon} flat={tool.flat} waves={true}
                                style={tool.style ? tool.style : "primary"} size="mini"
                                onclick={() => item.onclick()} />
                        </Secure>);
                    } else {
                        toolbar.push(<Secure operations={this.props.operationName}>
                            <DropDownButton label={tool.title} waves={true}
                                style={_.defaultTo(tool.style, "primary")} size="mini"
                                options={tool.items}
                                minWidth={_.defaultTo(tool.minWidth, "50px")}
                                data_uk_dropdown={_.defaultTo(tool.data_uk_dropdown, "")} />
                        </Secure>);
                    }
                }
            })
        }
        return (
            <h3 className={className} style={{paddingRight: "30px"}}>
                {super.translate(this.props.title)}
                {toolbar.map((tool, i) => <div key={i} className="uk-align-right">{tool}</div>)}
            </h3>
        );
    }
}

ActionHeader.contextTypes = {
    translator: PropTypes.object
};
