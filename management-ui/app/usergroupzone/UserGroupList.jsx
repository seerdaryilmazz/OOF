import _ from "lodash";
import uuid from "uuid";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card} from "susam-components/layout";
import {Notify} from "susam-components/basic";

import {UserGroupZoneService} from "../services";


export class UserGroupList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            userGroups: null
        }
    }

    componentDidMount() {
        this.loadUserGroups();
    }

    loadUserGroups() {
        UserGroupZoneService.getOrderPlanningUserGroups().then(response => {
            this.setState({userGroups: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleGroupSelectClick(e, item){
        e.preventDefault();
        this.props.onselect && this.props.onselect(item);
    }

    renderChildren(item){
        let childrenList = null;
        if(item.children){
            childrenList = <div>
                <ul className="md-list">
                    {item.children.map(child => {
                        return <li key={child.id}>
                            <div className="md-list-content">
                                                <span className="md-list-heading">
                                                    <a href="#" onClick={(e) => this.handleGroupSelectClick(e, child)}>{child.name}</a>
                                                </span>
                                {this.renderChildren(child)}
                            </div>
                        </li>;
                    })}
                </ul>
            </div>;
        }
        return childrenList;
    }

    render() {
        let userGroups = <ul className="md-list">{super.translate("There is no order planning user group")}</ul>;
        if (this.state.userGroups) {
            userGroups = <ul className="md-list">
                {
                    this.state.userGroups.map(item => {

                        return <li key={item.id}>
                            <div className="md-list-content">
                                <span className="md-list-heading">
                                    <a href="#" onClick={(e) => this.handleGroupSelectClick(e, item)}>{item.name}</a>
                                </span>
                            </div>
                            {this.renderChildren(item)}
                        </li>
                    })
                }
            </ul>;
        }
        return (
            <Card title="Order Planning Groups">
                {userGroups}
            </Card>
        );
    }
}