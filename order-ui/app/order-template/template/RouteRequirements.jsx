import React from 'react';
import * as axios from 'axios';
import uuid from 'uuid';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify} from 'susam-components/basic';
import {Grid, GridCell, Card, Section} from 'susam-components/layout';

import {RouteRequirementModal} from './RouteRequirementModal';

export class RouteRequirements extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {selectedItem: {}};

        this.acceptData(props);

    }

    componentWillReceiveProps(nextProps) {
        this.acceptData(nextProps);
    }

    acceptData(props) {
        let data;
        if (props.data && props.data.routeRequirements) {
            data = props.data.routeRequirements;
        } else {
            data = [];
        }

        let dataUpdated = false;
        data.forEach((elem) => {
            if (!elem.key) {
                dataUpdated = true;
                elem.key = uuid.v4();
            }
        });

        this.state.data = data;
    }

    handleNewRouteRequirementClick() {
        let state = _.cloneDeep(this.state);
        state.selectedItem = {};
        this.setState(state);
        this.modal.show();
    }

    handleSaveRequirement(requirement) {
        let state = _.cloneDeep(this.state);
        requirement.key = uuid.v4();
        state.data.push(requirement);
        this.setState(state);
        this.props.handleDataUpdate("routeRequirements", state.data);
    }

    handleItemClick(event, item) {
        event.preventDefault();
        let state = _.cloneDeep(this.state);
        state.selectedItem = item;
        this.setState(state);
        this.modal.show();
    }

    handleDeleteClick(event, item) {
        event.preventDefault();
        let state = _.cloneDeep(this.state);
        _.remove(state.data, req => {
            return req.key == item.key;
        });

        this.setState(state);
        this.props.handleDataUpdate("routeRequirements", state.data);
    }

    convertRoutes(routes){
        return routes ? routes.map(item => item.name).join(",") : "";
    }

    historyObjectToTextFcn(data) {
        let label = data.owner.label + ":";
        data.data.forEach((elem) => {
            label += "\n" + elem.permissionType.name + "," + elem.transportType.name + ",'";
            let routes = "";
            if (elem.routes) {

                elem.routes.forEach((route) => {
                    if (routes != "") {
                        routes += ",";
                    }
                    routes += route.name;
                });
            }
            label += routes + "'";
        })
        return label;
    }

    retrieveCardToolbarItems() {

        let hierarchialDataIcon = this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "routeRequirements");

        let toolbarElems = [];
        if (hierarchialDataIcon) {
            let hierarchialDataToolbarElem = {element: hierarchialDataIcon};
            toolbarElems.push(hierarchialDataToolbarElem);
        }

        let newRouteToolbarElem = {icon: "plus", action: () => this.handleNewRouteRequirementClick()};
        toolbarElems.push(newRouteToolbarElem);

        return toolbarElems;
    }

    render() {
        let list = super.translate("There is no route requirement");

        if (this.state.data.length > 0) {
            list =
                <ul className="md-list">
                {
                    this.state.data.map(item => {
                        let routeNames = this.convertRoutes(item.routes);
                        let typeBadge = <span className={"uk-badge uk-badge-" + (item.permissionType.id == "NOT_ALLOWED" ? "danger" : "success")}>{super.translate(item.permissionType.name)}</span>;
                        return (
                            <li key={item.key}>
                                <div className="md-list-content">
                                    <Grid collapse = {true}>
                                        <GridCell width="9-10" noMargin = {true}>
                                            <a href = "#" onClick={(e => this.handleItemClick(e, item))}><span className="md-list-heading">{item.transportType.name}</span></a>
                                            <span className="uk-text-small uk-text-muted uk-text-truncate">{routeNames}</span>
                                            {typeBadge}
                                        </GridCell>
                                        <GridCell width="1-10" noMargin = {true}>
                                            <a href="#" className="md-list-action" onClick = {(e) => this.handleDeleteClick(e, item)}><i className="md-icon uk-icon-times"/></a>
                                        </GridCell>
                                    </Grid>
                                </div>
                            </li>
                        );
                    })
                }
                </ul>;
        }

        let toolbarElems = this.retrieveCardToolbarItems();

        return (
            <div>

                <Card title={super.translate("Route Requirements")} toolbarItems={toolbarElems}>
                    {list}
                </Card>
                <RouteRequirementModal ref={(c) => this.modal = c}
                                       onsave={(requirement) => this.handleSaveRequirement(requirement)}
                                       value={this.state.selectedItem}/>
            </div>
        );
    }
}

RouteRequirements.contextTypes = {
    translator: React.PropTypes.object
};