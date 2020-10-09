import * as axios from 'axios';
import React from 'react';
import { Button, Notify, ReadOnlyDropDown, Span } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { LookupService } from '../services';


export class AccountSummaryInfo extends React.Component {


    constructor(props) {
        super(props);
        this.state={
            company:{},
            step:"ONEORDER"
        };
    }
    componentDidMount(){
        
        this.initializeLookups();
     }

    initializeLookups(){
        axios.all([
            LookupService.getAccountTypes(),
            LookupService.getSegmentTypes()
        ]).then(axios.spread((accountTypes, segmentTypes) => {
            this.setState({users: this.context.getUsers(), accountTypes: accountTypes.data, segmentTypes: segmentTypes.data});
        })).catch(error => {
            Notify.showError(error);
        })
    }

    updateState(key, value){
        this.props.onchange && this.props.onchange(key, value);
    }


    handleChangeOwner(value){
        let accountToEdit = _.cloneDeep(this.state.accountToEdit2);
        accountToEdit.accountOwner = value;
        this.setState({accountToEdit: accountToEdit});
    }

    renderCompanyLogo(){

        if(_.isEmpty(this.props.company)){
            return null;
        }

        let logoUrl = this.props.company.logoFilePath  ? baseResourceUrl + "/company-images/" + this.props.company.logoFilePath
            : baseResourceUrl + "/assets/img/logo-placeholder.png";
        return(
            <div className="uk-align-right">
                <div className="user_heading_avatar">
                    <div className="thumbnail">
                        <img src={logoUrl} />
                    </div>
                </div>
            </div>

        );
    }
    goToMapPage(){
        let company = this.props.company || {};
        let defaultLocation = _.find(company.companyLocations, 'default');
        let googlePlace = defaultLocation.googlePlaceUrl ? defaultLocation.googlePlaceUrl : "";
        window.open(googlePlace, "_blank");
    }

    renderDefaultLocationName(defaultLocation){

    /*    const MAX_PHONE_SIZE = 4;
        let result =[];

        let phoneNumbers = _.filter(defaultLocation.phoneNumbers, i => i.numberType.code != 'FAX' );
        let defaultPhoneNumbers = _.filter(phoneNumbers, i=>i.default);
        let otherPhoneNumbers = _.reject(phoneNumbers, i=>i.default);

        if(defaultPhoneNumbers.length >= MAX_PHONE_SIZE){
            for(let i = 0; i<MAX_PHONE_SIZE; i++){
                result.push(PhoneNumberUtils.format(defaultPhoneNumbers[i].phoneNumber))
            }
        } else {
            defaultPhoneNumbers && defaultPhoneNumbers.forEach(i=>{
                result.push(PhoneNumberUtils.format(i.phoneNumber))
            })
            let missed = MAX_PHONE_SIZE - defaultPhoneNumbers.length;
            let remaining = _.slice(otherPhoneNumbers, 0, missed);
            remaining && remaining.forEach(i=>{
                result.push(PhoneNumberUtils.format(i.phoneNumber));
            })
        } */
        return (
            <div>
                {_.get(defaultLocation, 'name')} 
              {/*  <span><i className="uk-icon-location-arrow" style={{ padding: "0 8px", fontSize: "150%", color: "blue"}}
                         title="Show On Map" data-uk-tooltip="{pos:'top'}" onClick={() => this.goToMapPage()} /></span>
                <span><i className="uk-icon-phone" style={{ color: "green", padding: "0 8px", fontSize: "150%" }}
        title={result.join("<br/>")} data-uk-tooltip="{pos:'top'}" /></span> */}
        </div>);
    }


    render() {
        let {company, account} = this.props;

        if(!company || !account){
            return null;
        }

        let sectorLabel;
        if (this.props.account.parentSector) {
            sectorLabel = this.props.account.parentSector.name;
        } else {
            sectorLabel = "Sector";
        }

        let subSectorLabel;
        if (this.props.account.subSector) {
            subSectorLabel = this.props.account.subSector.name;
        } else {
            subSectorLabel = "SubSector";
        }

        let defaultLocation = _.find(company.companyLocations, 'default');

        return (
           
            <Grid>
                <GridCell width="9-10"> 
                    <Grid> 
                        <GridCell width="1-4" noMargin={true}>
                            <Span label="Short Name" value={company.shortName} />
                        </GridCell>
                        <GridCell width="1-4" noMargin={true}>
                            <Span label="Country" translate={true} value={this.props.account.country ? this.props.account.country.name : null} />
                        </GridCell>
                        <GridCell width="1-4" noMargin={true}>
                            {
                                this.props.account.readOnly
                                    ? <Span label="Account Owner" value={_.upperCase(this.props.account.accountOwner)} />
                                    : <ReadOnlyDropDown options={this.state.users} label="Account Owner" labelField="displayName"
                                        valueField="username" required={true} readOnly={this.props.account.readOnly}
                                        value={this.props.account.accountOwner}
                                        onchange={(accountOwner) => { accountOwner ? this.updateState("accountOwner", accountOwner.username) : null }} />
                            }
                        </GridCell>
                        <GridCell width="1-4" noMargin={true}>
                            <Button label={[sectorLabel, subSectorLabel]}
                                disabled={!this.props.company}
                                style="primary" size="small"
                                onclick={() => this.sectorInfoModal.open()} />
                        </GridCell>
                        <GridCell width="1-4">
                            {
                                this.props.account.readOnly
                                    ? <Span label="Type" translate={true} value={_.upperCase(this.props.account.accountType.name)} />
                                    : <ReadOnlyDropDown options={this.state.accountTypes} label="Type"
                                        required={true} readOnly={this.props.account.readOnly}
                                        value={this.props.account.accountType}
                                        translate={true}
                                        onchange={(accountType) => { accountType ? this.updateState("accountType", accountType) : null }} />
                            }
                        </GridCell>
                        <GridCell width="1-4">
                            {
                                this.props.account.readOnly
                                    ? <Span label="Segment" translate={true} value={_.upperCase(this.props.account.segment.name)} />
                                    : <ReadOnlyDropDown options={this.state.segmentTypes} label="Segment"
                                        required={true} readOnly={this.props.account.readOnly}
                                        value={this.props.account.segment}
                                        translate={true}
                                        onchange={(segment) => { segment ? this.updateState("segment", segment) : null }} />
                            }
                        </GridCell>
                        <GridCell width="2-4">
                            <Span label="Default Location" value={this.renderDefaultLocationName(defaultLocation)} />
                            <span className="uk-text-small uk-text-muted uk-text-bold">{_.get(defaultLocation, 'formattedAddress')}</span>
                        </GridCell>
                     </Grid>
                    </GridCell>
                    <GridCell width="1-10">
                        {this.renderCompanyLogo()}
                    </GridCell>
            </Grid>
            
         
        );
    }
}
AccountSummaryInfo.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    user: React.PropTypes.object,
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
};