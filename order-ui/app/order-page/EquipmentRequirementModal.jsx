import React from "react";
import _ from "lodash";
import {TranslatingComponent} from "susam-components/abstract";
import {DropDown, TextInput} from "susam-components/basic";
import {Grid, GridCell, Modal} from "susam-components/layout";
import {OrderService} from "../services/OrderService";

export class EquipmentRequirementModal extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {requirement:{}, equipmentTypeOptions: []};
    }

    componentDidMount() {
        OrderService.getEquipmentTypes().then(response => {
            this.setState({
                equipmentTypeOptions: response.data,
            });
        }).catch(error => {
            Notify.showError(error);
        });
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
                    <GridCell width="1-2">
                        <TextInput label="Count" value={this.state.requirement.count}
                                onchange={(value)=> this.updateState("count", value)}/>
                    </GridCell>

                    <GridCell width="1-2">
                        <DropDown label="Equipment" value={this.state.requirement.equipmentType}
                                  options={this.state.equipmentTypeOptions}
                                  onchange={(value)=> this.updateState("equipmentType",value)}>
                        </DropDown>
                    </GridCell>
                </Grid>
            </Modal>
        );
    }
}