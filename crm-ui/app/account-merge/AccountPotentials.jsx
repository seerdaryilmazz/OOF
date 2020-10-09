import React from "react";

import { PotentialSummaryInfo } from "../potential/PotentialSummaryInfo";
import { Card , Grid, GridCell} from 'susam-components/layout';
import { ActionHeader } from '../utils';
import { CrmAccountService , CrmQuoteService} from "../services";
import { Notify} from 'susam-components/basic';
import uuid from "uuid";


export class AccountPotentials extends React.Component {

    constructor(props) {
        super(props);
        this.state={
        };
        this.moment = require("moment");
    }

    componentDidMount(){
        this.retrievePotentials(this.props.accountToEdit, "accountToEditPotentials");
        this.retrievePotentials(this.props.accountToMerge, "accountToMergePotentials");
    }

    retrievePotentials(account, whichAccountPotential) {
        if (_.has(this.props.stepData, whichAccountPotential)) {
            this.setState(prevState => {
                prevState[whichAccountPotential] = _.get(this.props.stepData, whichAccountPotential);
                return prevState;
            });
        } else {
            CrmAccountService.retrievePotentials(account.id).then(response => {
                this.setState(prevState => {
                    prevState[whichAccountPotential] = response.data;
                    return prevState;
                })
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    retrievePotential(){
        CrmAccountService.getPotentialById().then(response => {
            this.setState(
                potentialInfo = response.data
            );
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleAddPotential(value) {
        let params = {
            potentialId: value.id,
            accountId: this.props.accountToEdit.id
        }
        CrmAccountService.checkForDuplicate(params).then(response => {
            let potentialToAdd = _.cloneDeep(value);
            potentialToAdd._key = uuid.v4();
            this.setState(prevState => {
                prevState.accountToEditPotentials.push(potentialToAdd);
                _.remove(prevState.accountToMergePotentials, i => i.id === potentialToAdd.id);
                return prevState;
            });
        }).catch(error => {
            Notify.confirm("This potential line can be merged as inactive.Do you want to continue?", () => this.addAsInactive(value));

        })
    }

    addAsInactive(value){

        let potentialToAdd = _.cloneDeep(value);
        potentialToAdd._key = uuid.v4();
        potentialToAdd.validityEndDate = this.moment().subtract(1,"day").format('DD/MM/YYYY');
        potentialToAdd.createdAt = this.moment().tz("UTC").format('DD/MM/YYYY HH:mm')+ " Europe/Istanbul";
        potentialToAdd.status.id = 'INACTIVE'
        potentialToAdd.status.code = 'INACTIVE'
        potentialToAdd.status.name = 'Inactive'
        this.setState(prevState => {

            prevState.accountToEditPotentials.push(potentialToAdd);
            _.remove(prevState.accountToMergePotentials, i => i.id === potentialToAdd.id);
            console.log(potentialToAdd)
            return prevState;
        });
    }

    handleIgnoreAccountPotential(potential){

        CrmQuoteService.checkQuotesByPotential(potential.id).then(response => {

            let accountToMerge = _.cloneDeep(potential);
            this.setState(prevState => {
                _.remove(prevState.accountToMergePotentials, i => i.id === accountToMerge.id);
                 return prevState;
            });       
        }).catch(error => {
            Notify.showError(error);
        })
    
    }

    next(){
        return new Promise((resolve, reject)=>{

            if(this.state.accountToMergePotentials && this.state.accountToMergePotentials.length > 0){
                Notify.showError("Please add or ignore all potentials");
                return false;
            }
            this.props.onPotentialComplete({ potentials: this.combineList(), stepData: this.state });
            resolve(true);
        });

    }
    combineList(){
        let result = [];
        this.state.accountToEditPotentials.forEach(item => {
            result.push(item);
        })
        return result;
    }

    handleSavePotential(potentials){
        this.props.onSave && this.props.onSave(potentials);
    }

    
    render() {
     
        let existingPotentialList = null;
        let newPotentialList = null;

        let existingPotentials = this.state.accountToEditPotentials;
        let newPotentials = this.state.accountToMergePotentials;

        if (existingPotentials) {

            existingPotentialList =
                    <GridCell width="1-1" margin="small">
                        <ActionHeader title="Potentials" removeTopMargin={true} />
                        <PotentialSummaryInfo 
                         potentials={existingPotentials}
                         onsave = {(potentials) => this.handleSavePotential(potentials)}
                       />
                    </GridCell>

            }

            if (newPotentials && newPotentials.length > 0) {
                newPotentialList = 
                <GridCell width="1-1" margin="small">
                <ActionHeader title="New Potentials" removeTopMargin={true} />
                <PotentialSummaryInfo potentials={newPotentials}
                    showAddButton={true}
                    onadd={(data) => this.handleAddPotential(data)}
                    showIgnoreButton={true}
                    onignore={(data) => this.handleIgnoreAccountPotential(data)}
             
                     />
                </GridCell>
            }

        return (
            <Card style={{ backgroundColor: "white" }}>
                <Grid>
                    <GridCell width="1-1" margin="small">
                        {newPotentialList}
                    </GridCell>
                     <GridCell >
                        {existingPotentialList}
                     </GridCell>

                </Grid>
            </Card>

        );

    }

}