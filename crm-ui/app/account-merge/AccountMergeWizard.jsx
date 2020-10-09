import _ from "lodash";
import React from "react";
import { Notify } from 'susam-components/basic';
import { Wizard } from "susam-components/layout";
import { CrmAccountService } from "../services";
import { AccountActivities } from "./AccountActivities";
import { AccountOpportunities } from "./AccountOpportunities";
import { AccountPotentials } from "./AccountPotentials";
import { AccountQuotes } from "./AccountQuotes";
import { GeneralInfo } from "./GeneralInfo";

export class AccountMergeWizard extends React.Component {

    
    constructor(props) {
        super(props);
        this.state = {
            
        };

        this.moment = require("moment");
    }
    componentDidMount(){

    }

    retrievePotentials(account){
        CrmAccountService.retrievePotentials(account.id).then(response => {
            this.setState({
                accountToMergePotentials : response.data
            });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleAccountGeneralChange(key, value){
        let accountToEdit = _.cloneDeep(this.props.accountToEdit);
        accountToEdit[key] = value;
        this.props.onGeneralInfoUpdate && this.props.onGeneralInfoUpdate(accountToEdit);
    }

    renderAccount(){
        return <GeneralInfo ref={c=>this.accountGeneral=c}
            accountToEdit = {this.props.accountToEdit}
            accountToMerge = {this.props.accountToMerge}
            accountOriginal = {this.props.accountOriginal}
            onchange = {(key, value) => this.handleAccountGeneralChange(key, value)}
            onAccountComplete = {(account)=>this.props.onNext({account: account})}
        />
    }

    renderAccountQuotes(){
        return(
            <AccountQuotes ref={c=>this.accountQuotes=c} 
                accountToEdit = {this.props.accountToEdit} 
                accountToMerge = {this.props.accountToMerge} 
                onQuoteComplete={data=>{this.props.onNext({quotes:data.quotes, agreements: data.agreements})}}
               />
        ); 
    }
    renderAccountActivities(){
        return(
            <AccountActivities ref={c=>this.accountActivities=c}
            accountToEdit = {this.props.accountToEdit}
            accountToMerge = {this.props.accountToMerge}
            onActivityComplete = {data => {this.props.onNext({activities:data.activities})}}/>
        );
    }

    renderAccountPotentials(){
        return(
            <AccountPotentials ref={c=>this.accountPotentials=c} 
                                stepData={this.state.potentialStepData}
                                accountToMerge = {this.props.accountToMerge} 
                                accountToEdit ={this.props.accountToEdit} 
                                onPotentialComplete = {data => this.setState({potentialStepData: data.stepData}, ()=>this.props.onNext({potentials:data.potentials}))}
                                onchange = {(key, value) => this.handlePotentialChange(key, value)}
                                />
        )
    }

    renderAccountOpportunities() {
        return (
            <AccountOpportunities ref = {(c => this.accountOpportunities = c)}
                                    stepData = {this.state.opportunityStepData}
                                    accountToMerge = {this.props.accountToMerge} 
                                    accountToEdit ={this.props.accountToEdit} 
                                    onOpportunitiesComplete = {data => this.setState({opportunityStepData: data.stepData}, () => this.props.onNext({opportunities:data.opportunities}))}
                                />
        )
    }

    handleWizardSave(){
       
            Promise.resolve(this.accountActivities.next()).then((value) => {
                if(value){
                    this.saveAccount();
                }
            }).catch(error => {
                console.log(error);
            });
     
    }

    saveAccount(){
        this.props.onfinish && this.props.onfinish(this.state.accountToEdit, (response) => {
                let params = this.props.origin ? "?origin=" + this.props.origin : "";
                try {
                    this.context.router.push(`/ui/crm/account/${response.data.id}/view${params}`);
                } catch (error) {
                    console.log(error)
                }
        });

    }

    handleCancelClick(){
        this.context.router.goBack();
    }

    render(){
        let steps;

            steps = [
                {title:"General Info", onNextClick: () => {return this.accountGeneral.next()}, prevButtonLabel: "Cancel", onPrevClick: () => {this.handleCancelClick()}},
                {title: "Opportunities", onNextClick: () => {return this.accountOpportunities.next()}},
                {title:"Potentials", onNextClick: () => {return this.accountPotentials.next()}},
                {title:"Quotes & Agreements", onNextClick: () => {return this.accountQuotes.next()}},
                {title:"Activities", onNextClick: () => {this.handleWizardSave()}, nextButtonLabel: "Save", nextButtonStyle:"success"},
                  
            ];   
       
        return (
            <div style={{marginTop: "-40px"}}>
                <Wizard steps = {steps} 
                 hidePrevButton={true}
                 backgroundColor="transparent"
                 textColorNext="md-color-blue-900"
                 textColorPrev="md-color-orange-800"
                >
                    {this.renderAccount()}
                    {this.renderAccountOpportunities()}
                    {this.renderAccountPotentials()}
                    {this.renderAccountQuotes()}
                    {this.renderAccountActivities()}
                </Wizard>   
            </div>
        );
    }
}

AccountMergeWizard.contextTypes = {
    router: React.PropTypes.object.isRequired,
    storage: React.PropTypes.object,
    translator: React.PropTypes.object
};
