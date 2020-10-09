import React from "react";

import { OpportunitySummaryInfo } from "../opportunity/OpportunitySummaryInfo";
import { Card , Grid, GridCell} from 'susam-components/layout';
import { ActionHeader } from '../utils';
import { CrmOpportunityService, CrmQuoteService} from "../services";
import { Notify} from 'susam-components/basic';
import uuid from "uuid";

export class AccountOpportunities extends React.Component {

    constructor(props) {
        super(props);
        this.state={
        };
    }

    componentDidMount() {
        this.retrieveOpportunities(this.props.accountToEdit, "accountToEditOpportunities");
        this.retrieveOpportunities(this.props.accountToMerge, "accountToMergeOpportunities");
    }

    retrieveOpportunities(account, whichAccountOpportunity) {
        if(_.has(this.props.stepData, whichAccountOpportunity)) {
            this.setState(prevState => {
                prevState[whichAccountOpportunity] = _.get(this.props.stepData, whichAccountOpportunity);
                return prevState;
            });
        } else {
            CrmOpportunityService.getByAccountId(account.id).then(response => {
                this.setState(prevState => {
                    prevState[whichAccountOpportunity] = response.data;
                    return prevState;
                });
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    handleAddOpportunity(value){
        let opportunityToAdd = _.cloneDeep(value);
        opportunityToAdd._key = uuid.v4();
        this.setState(prevState => {
            prevState.accountToEditOpportunities.push(opportunityToAdd);
            _.remove(prevState.accountToMergeOpportunities, i=> i.id === opportunityToAdd.id);
            return prevState;
      });
    }

    handleIgnoreAccountOpportunity(opportunity){
        let params={attributeName: "opportunity", attributeValue: _.toString(opportunity.id)};
        CrmQuoteService.getQuotesByAttribute(params).then(response =>{
            if(!_.isEmpty(response.data)){
                Notify.showError("The opportunity with active quotes can't ignored!");
                return false;
            }

            let opportunityToIgnore = _.cloneDeep(opportunity);
            this.setState(prevState => {
                _.remove(prevState.accountToMergeOpportunities, i => i.id === opportunityToIgnore.id );
                return prevState;
        });
        }).catch(error => {
            Notify.showError(error);
        })
    }

    next(){
        return new Promise((resolve, reject) => {
            if(this.state.accountToMergeOpportunities && this.state.accountToMergeOpportunities.length > 0){
                Notify.showError("Please add or ignore all opportunities");
                return false;
            }
            this.props.onOpportunitiesComplete({ opportunities: this.combineList(), stepData: this.state });
            resolve(true);
        })
    }

    combineList(){
        let result=[];
        this.state.accountToEditOpportunities.forEach(item => {
            result.push(item);
        })
        return result;
    }

    render(){
        let existingOpportunityList = null;
        let newOpportunityList = null;

        let existingOpportunities = this.state.accountToEditOpportunities;
        let newOpportunities = this.state.accountToMergeOpportunities;

        if(existingOpportunities){
            existingOpportunityList = 
                <GridCell width="1-1" margin="small">
                    <ActionHeader title="Opportunities" removeTopMargin={true} />
                     <OpportunitySummaryInfo 
                        opportunities={existingOpportunities} />
                </GridCell>  
        }
        if(newOpportunities && newOpportunities.length > 0) {
            newOpportunityList = 
                <GridCell width="1-1" margin="small">
                    <ActionHeader title="New Opportunities" removeTopMargin={true} />
                    <OpportunitySummaryInfo opportunities = {newOpportunities}
                        showAddButton = {true}
                        onadd={(data) => this.handleAddOpportunity(data)}
                        showIgnoreButton={true}
                        onignore={(data) => this.handleIgnoreAccountOpportunity(data)} />
                </GridCell>
        }
        return (
            <Card style={{ backgroundColor: "white" }}>
                <Grid>
                    <GridCell width="1-1" margin="small">
                        {newOpportunityList}
                    </GridCell>
                     <GridCell >
                        {existingOpportunityList}
                     </GridCell>

                </Grid>
            </Card>

        );


    }



}