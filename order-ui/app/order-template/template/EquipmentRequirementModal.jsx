import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {DropDown,Button, Checkbox, RadioGroup} from 'susam-components/basic';
import {Slider} from 'susam-components/advanced';
import {Card, Grid, GridCell,Modal} from 'susam-components/layout';

export class EquipmentRequirementModal extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {requirement:{}};
    }
    updateState(field, value){
        let requirement = _.cloneDeep(this.state.requirement);
        requirement[field] = value;
        this.setState({requirement: requirement});
    }

    componentWillReceiveProps(nextProps){
        let state = _.cloneDeep(this.state);
        state.requirement = nextProps.value;
        this.setState(state);
    }

    clear(){
        this.setState({requirement: {}});
    }

    handleSave() {
        if(!this.state.requirement.count) {
            this.state.requirement.count = 1;
        }
        this.props.onsave && this.props.onsave(this.state.requirement);
        this.modal.close();
    };

    handleClose(){
        this.modal.close();
    }
    show(){
        this.modal.open();
    }
    render(){
        return(
            <Modal ref={(c) => this.modal = c} title="New Equipment Requirement"
                   actions = {[{label:"Close", action:() => this.handleClose()},
                       {label:"Save", buttonStyle:"primary", action:() => this.handleSave()}]}>
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <Slider label="Count" min="1" max="20" from={this.state.requirement.count} to={this.state.requirement.count}
                                onchange={(value)=> this.updateState("count", value)}/>
                    </GridCell>

                    <GridCell width="1-1">
                        <DropDown label="Equipment" value={this.state.requirement.equipmentType}
                                  options={[{id:1,name:"SPANZET"},{id:2,name:"NONSKID"}]}
                                  onchange={(value)=> this.updateState("equipmentType",value)}>
                        </DropDown>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}