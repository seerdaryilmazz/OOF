import React from 'react';
import * as axios from 'axios';
import uuid from 'uuid';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify} from 'susam-components/basic';
import {Grid, GridCell, Card, Section} from 'susam-components/layout';

import {EquipmentRequirementModal} from './EquipmentRequirementModal';

export class EquipmentRequirements extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { selectedItem: {}};
        this.acceptData(props);

    }
    componentWillReceiveProps(nextProps) {
        this.acceptData(nextProps);
    }
    acceptData(props) {
        let data;
        if (props.data && props.data.equipmentRequirements) {
            data = props.data.equipmentRequirements;
        } else {
            data = [];
        }

        let dataUpdated = false;
        data.forEach((elem) => {
            if(!elem.key) {
                dataUpdated = true;
                elem.key = uuid.v4();
            }
        });

        this.state.data = data;
    }
    handleNewEquipmentRequirementClick(){
        let state = _.cloneDeep(this.state);
        state.selectedItem = {};
        this.setState(state);
        this.modal.show();
    }
    handleSaveRequirement(requirement){
        let state = _.cloneDeep(this.state);
        requirement.key = uuid.v4();
        state.data.push(requirement);
        this.setState(state);
        this.props.handleDataUpdate("equipmentRequirements", state.data);
    }
    handleItemClick(event, item){
        event.preventDefault();
        let state = _.cloneDeep(this.state);
        state.selectedItem = item;
        this.setState(state);
        this.modal.show();
    }
    handleDeleteClick(event, item){
        event.preventDefault();
        let state = _.cloneDeep(this.state);
        _.remove(state.data, req => {
            return req.key == item.key;
        });

        this.setState(state);
        this.props.handleDataUpdate("equipmentRequirements", state.data);
    }
    historyObjectToTextFcn(data) {
        let label = data.owner.label + ":";
        data.data.forEach((elem) => {
            label += "\n" + elem.equipmentType.name + ":" +  elem.count;
        })
        return label;
    }

    retrieveCardToolbarItems() {

        let hierarchialDataIcon = this.props.hierarchialDataIcon(this.historyObjectToTextFcn, "equipmentRequirements");

        let toolbarElems = [];
        if (hierarchialDataIcon) {
            let hierarchialDataToolbarElem = {element: hierarchialDataIcon};
            toolbarElems.push(hierarchialDataToolbarElem);
        }

        let newRouteToolbarElem = {icon: "plus", action: () => this.handleNewEquipmentRequirementClick()};
        toolbarElems.push(newRouteToolbarElem);

        return toolbarElems;
    }
    
    render(){
        
        let list = super.translate("There is no equipment requirement");
        if(this.state.data.length > 0){
            list =
                <ul className="md-list">
                    {
                        this.state.data.map(item => {
                            return (
                                <li key = {item.key}>
                                    <div className="md-list-content">
                                        <Grid collapse = {true}>
                                            <GridCell width="9-10" noMargin = {true}>
                                                <a href = "#" onClick={(e => this.handleItemClick(e, item))}><span className="md-list-heading">{item.equipmentType.name}</span></a>
                                                <span className="uk-text-small uk-text-muted uk-text-truncate">{item.count}</span>
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

        return(
            <div>
                <Card title = {super.translate("Equipment Requirements")} toolbarItems = {toolbarElems}>
                    {list}
                </Card>
                <EquipmentRequirementModal ref = {(c) => this.modal = c} onsave = {(requirement) => this.handleSaveRequirement(requirement)} value = {this.state.selectedItem}/>
            </div>
        );
    }
}

EquipmentRequirements.contextTypes = {
    translator: React.PropTypes.object
};