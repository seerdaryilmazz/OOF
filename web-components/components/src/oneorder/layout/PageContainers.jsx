import React from "react";
import _ from 'lodash';

export const ListContainer = (props) => {
    return (
        <div id="list-container">
            <div className="md-list-outside-wrapper">
                {props.children}
            </div>
        </div>
    )
};

export class FormContainer extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div id="form-container" className={this.props.width ? "uk-width-large-" + this.props.width : "uk-width-large-1-1"}>
                {this.props.children}
            </div>
        );
    }
}

export class ToolbarItems extends React.Component {

    handleOnClick(e, item){
        e.preventDefault();
        item.onclick && item.onclick();
    }

    handleOnClickNoDropdown(e, item){
        e.preventDefault();
        item.action && item.action();
    }

    renderToolbar(){
        let notInDropDown = _.filter(this.props.actions, (item) => {return !item.inDropdown});
        return notInDropDown.map(item =>
            {
                if (item.items) {
                    return this.renderSubItems(item.library);
                }
                else{
                    switch (item.library) {
                        case "material":
                            return <i key={item.name}
                                      className="page-toolbar-icon md-icon material-icons"
                                      onClick={(e) => this.handleOnClick(e, item)}>{item.icon}</i>;
                            break;
                        case "uikit":
                            return <i key={item.name}
                                      className={"page-toolbar-icon md-icon uk-icon-" + item.icon}
                                      onClick={(e) => this.handleOnClick(e, item)}/>;
                            break;
                        case "none":
                            return false;
                            break;
                        default:
                            return <i key={item.icon}
                                      className={"page-toolbar-icon md-icon uk-icon-" + item.icon}
                                      onClick={(e) => this.handleOnClickNoDropdown(e, item)}/>;
                    }
                }
            }
        )
    }
    renderDropDownToolbarItems(inDropDown){
        return inDropDown.map(item =>
            {
                switch (item.library) {
                    case "material":
                        return <li key={item.name}>
                                    <a href="#" onClick={(e) => this.handleOnClick(e, item)}>
                                        <i className="page-toolbar-icon material-icons uk-margin-small-right">{item.icon}</i>
                                        {item.name}
                                    </a>
                               </li>;
                        break;
                    case "uikit":
                        return <li key={item.name}>
                                   <a href="#" onClick={(e) => this.handleOnClick(e, item)}>
                                        <i className={"page-toolbar-icon uk-margin-small-right uk-icon-" + item.icon} />
                                        {item.name}
                                   </a>
                               </li>;
                        break;
                    default:
                        return <li key={item.name}>
                            <a href="#" onClick={(e) => this.handleOnClick(e, item)}>
                                {item.name}
                            </a>
                        </li>;
                }
            }
        )
    }
    renderDropDownToolbar(){
        let inDropDown = _.filter(this.props.actions, {inDropdown: true});
        if(inDropDown.length > 0){
            return <div className="md-card-dropdown" data-uk-dropdown="{pos:'bottom-right'}">
                <i className="page-toolbar-icon md-icon material-icons">more_vert</i>
                <div className="uk-dropdown uk-dropdown-small">
                    <ul className="uk-nav">{this.renderDropDownToolbarItems(inDropDown)}</ul>
                </div>
            </div>;
        }
        return null;
    }

    renderSubItems(library){
        let hasSubItems = _.filter(this.props.actions, (item) => {return item.items});
        return hasSubItems.map(item =>
            <div className="md-card-dropdown" data-uk-dropdown="{pos:'bottom-center'}" style={{marginLeft: 4, marginRight: 4}}>
                {library === "material"
                    ?
                    <i className="page-toolbar-icon md-icon material-icons">{item.icon}</i>
                    :
                    <i className={"page-toolbar-icon md-icon uk-margin-small-right uk-icon-" + item.icon}/>
                }
                <div className="uk-dropdown uk-dropdown-small">
                    <ul className="uk-nav">{this.renderDropDownToolbarItems(item.items)}</ul>
                </div>
            </div>
        )
    }
    render(){
        if(!this.props.actions || this.props.actions.length == 0){
            return null;
        }
        return (
            <div className="md-card-toolbar-actions">
                {this.renderToolbar()}
                {this.renderDropDownToolbar()}
            </div>

        )
    }
};