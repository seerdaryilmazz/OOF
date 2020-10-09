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
        this.state = {requirements:[], selectedItem: {}};
        if(props.project) {
            this.addEquipmentRequirements(props.project);
        }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.project) {
            this.addEquipmentRequirements(nextProps.project);
        }
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
        state.requirements.push(requirement);
        this.setState(state);
        this.props.onupdate && this.props.onupdate(state.requirements);
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
        _.remove(state.requirements, req => {
            return req.key == item.key;
        });

        this.setState(state);
        this.props.onupdate && this.props.onupdate(state.requirements);
    }
    addEquipmentRequirements(projectData){
        if(!this.state.locked && projectData && projectData.equipmentRequirements && projectData.equipmentRequirements.data.length > 0) {
            this.state.requirements = projectData.equipmentRequirements.data;
            this.state.requirements.forEach((elem) => {
                if(!elem.key) {
                    elem.key = uuid.v4();
                }
            });
            this.state.locked = true;
            this.setState(this.state);
        }
    }
    retrieveDeleteButton(item) {
        if(this.state.locked) {
            return null;
        } else {
            return (
                <GridCell width="1-10" noMargin = {true}>
                    <a href="#" className="md-list-action" onClick = {(e) => this.handleDeleteClick(e, item)}><i className="md-icon uk-icon-times"/></a>
                </GridCell>
            );
        }
    }
    retrieveAddIcon() {
        if (this.state.locked) {
            return [];
        } else {
            return (
                [{icon: "plus", action: () => this.handleNewEquipmentRequirementClick()}]
            );
        }
    }
    retrieveHeader(item) {
        if (this.state.locked) {
            return <a href="#"  onClick={(e => {e.preventDefault()})}><span className="md-list-heading">{item.equipmentType.name}</span></a>;
        } else {
            return <a href="#" onClick={(e => this.handleItemClick(e, item))}><span className="md-list-heading">{item.equipmentType.name}</span></a>;
        }

    }
    render(){
        let list = super.translate("There is no equipment requirement");
        if(this.state.requirements.length > 0){
            list =
                <ul className="md-list">
                    {
                        this.state.requirements.map(item => {
                            return (
                                <li key = {item.key}>
                                    <div className="md-list-content">
                                        <Grid collapse = {true}>
                                            <GridCell width="9-10" noMargin = {true}>
                                                {this.retrieveHeader(item)}
                                                <span className="uk-text-small uk-text-muted uk-text-truncate">{item.count}</span>
                                            </GridCell>
                                            {this.retrieveDeleteButton(item)}
                                        </Grid>
                                    </div>
                                </li>
                            );
                        })
                    }
                </ul>;
        }
        let toolbar = this.retrieveAddIcon();
        return(
            <div>
                <Card title = {super.translate("Equipment Requirements")} toolbarItems = {toolbar}>
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