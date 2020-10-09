import * as axios from "axios";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Card, Grid, GridCell, Modal } from 'susam-components/layout';
import uuid from "uuid";
import { LookupService } from "../services";
import { ActionHeader } from '../utils/ActionHeader';
import { ContainerRequirement } from "./ContainerRequirement";


export class ContainerRequirements extends TranslatingComponent {
    state = {};
    constructor(props) {
        super(props);
        axios.all([
            LookupService.getContainerTypes(),
            LookupService.getChargeableVolumes('FCL')
        ]).then(axios.spread((containerTypes, chargeableVolumes) => {
            this.setState({
                containerTypes: containerTypes.data,
                chargeableVolumes: chargeableVolumes.data,
                teuColumnPrinter: new TeuPrinter(chargeableVolumes.data)
            });
        }));

    }

    updateState(key, value) {
        this.setState(prevState => {
            _.set(prevState, key, value);
            return prevState;
        });
    }

    addContainerRequirement(){
        if(this.containerRequirementForm.validate()){
            let containerRequirements = _.cloneDeep(this.props.containerRequirements);
            if(!containerRequirements){
                containerRequirements = [];
            }
            let containerRequirement = this.state.containerRequirement;
            containerRequirement._key= uuid.v4();
            containerRequirements.push(containerRequirement);
            this.props.onChange(containerRequirements);
            this.containerRequirementModal.close();
        }
    }

    editContainerRequirement(row){
        if(this.containerRequirementForm.validate()){
            let containerRequirements = _.cloneDeep(this.props.containerRequirements);
            if(containerRequirements){
                const index = containerRequirements.findIndex(containerRequirement => containerRequirement._key === row._key);
                if (index !== -1) {
                    containerRequirements[index] = row;
                    this.props.onChange(containerRequirements);
                    this.containerRequirementModal.close()
                }
            }
        }

    }

    removeContainerRequirement(data){
        let containerRequirements = _.cloneDeep(this.props.containerRequirements);
        if(containerRequirements){
            const index = containerRequirements.findIndex(containerRequirement => containerRequirement._key === data._key);
            if (index !== -1) {
                containerRequirements.splice(index, 1);
                this.props.onChange(containerRequirements);
            }
        }
    }

    openContainerRequirementForm(containerRequirement = {}){
        this.setState({ containerRequirement }, () => { this.containerRequirementModal.open() });
    }

    renderContainerRequirementForm(){
        let title = "Container Requirement";
        let {containerRequirement} = this.state;
        return(
            <Modal ref={(c) => this.containerRequirementModal = c}
                    title = {title} large={true}
                    closeOnBackgroundClicked={false}
                    onclose={()=>this.setState({containerRequirement: undefined})}
                    actions={[
                       {label: "SAVE", action: () => {this.state.containerRequirement._key ? this.editContainerRequirement(this.state.containerRequirement) : this.addContainerRequirement()}},
                       {label: "CLOSE", action: () => this.containerRequirementModal.close()}]}>
                {containerRequirement && <ContainerRequirement ref={(c) => this.containerRequirementForm = c}
                                    containerTypes = {this.state.containerTypes}
                                    chargeableVolumes={this.state.chargeableVolumes}
                                    containerRequirement = {containerRequirement}
                                    onChange={(value) => this.updateState("containerRequirement", value)}/>}
            </Modal>
        );
    }

    renderDataTable(){

        return (
            <Grid>
                <GridCell width="1-2" norMargin={true}>
                    <DataTable.Table data={this.props.containerRequirements}>
                        <DataTable.Text  field="type.name" header="Type" width="50" editable={false}/>
                        <DataTable.Text field="volume.name" header="Size" width="25" editable={false}/>
                        <DataTable.Text field="quantity" header="Quantity" width="20" editable={false}/>
                        {this.state.teuColumnPrinter && <DataTable.Text header="" width="25" printer={this.state.teuColumnPrinter} editable={false}/>}
                        <DataTable.ActionColumn>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="editContainerRequirement" track="onclick"
                                                     onaction = {(data) => this.openContainerRequirementForm(data)}>
                                <Button icon="pencil" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper shouldRender = {() => !this.props.readOnly} key="deleteContainerRequirement" track="onclick"
                                                     onaction = {(data) => this.removeContainerRequirement(data)}>
                                <Button icon="close" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return (
            <Card>
                <ActionHeader title="Container Requirements" readOnly={this.props.readOnly}
                              tools={[{title: "Add", items: [{label: "", onclick: () => this.openContainerRequirementForm()}]}]} />
                {this.renderDataTable()}
                {this.renderContainerRequirementForm()}
            </Card>
        );
    }
}

class TeuPrinter{
    constructor(chargeableVolumes){
        this.chargeableVolumes = chargeableVolumes
    }

    printUsingRow(row){
        let chargeableVolume = _.find(this.chargeableVolumes, i=>i.code === row.volume.code);
        return <div className="uk-align-right uk-text-bold"> {chargeableVolume.teuUnit * row.quantity} TEU</div> ;
    }
}
