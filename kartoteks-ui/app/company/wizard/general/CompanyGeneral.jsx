import * as axios from "axios";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Form, Notify, Span, TextInput } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell, Loader } from "susam-components/layout";
import { CompanyService, LookupService } from '../../../services/KartoteksService';
import { CompanyGeneralUpdateList } from './CompanyGeneralUpdateList';
import { LogoSearchModal } from './LogoSearchModal';
import * as TaxOffices from './taxOffices/';

export class CompanyGeneral extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
        this.taxOfficeConfigs = {
            TR: <TaxOffices.TaxFormTR />,
            RO: <TaxOffices.TaxFormRO />,
            EU: <TaxOffices.TaxFormEU />,
            DEFAULT: <TaxOffices.TaxFormAlphaNumericTax />
        };
    }

    componentDidMount(){
        this.initializeState(this.props);
        this.initializeLookups();
    }

    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }

    initializeState(props){
        let state = _.cloneDeep(this.state);
        state.showUpdateList = false;
        if(props.mode.startsWith("MergeCompany")){
            state.showUpdateList = true;
        }
        this.setState(state);
    }

    initializeLookups(){
        axios.all([
            LookupService.getCountryList(),
            LookupService.getSalesPortfolioList(),
            LookupService.getCompanySegmentTypeList()
        ]).then(axios.spread((countries, salesPortfolios, segmentTypes) => {
            let state = _.cloneDeep(this.state);
            state.countries = countries.data;
            state.salesPortfolios = salesPortfolios.data;
            state.segmentTypes = segmentTypes.data;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
        })
    }


    handleUpdateFromUpdateList(items){
        items.forEach(item => {
            this.props.onchange && this.props.onchange(item.fieldToCopy, item.valueToCopy);
        });
    }
    handleUndoUpdateFromUpdateList(items){
        items.forEach(item => {
            this.props.onchange && this.props.onchange(item.fieldToCopy, item.valueToUndo);
        });
    }

    next(){
        let companyToEdit = _.cloneDeep(this.props.companyToEdit);
        this.props.onchange("name", companyToEdit.name.trim());
        this.props.onchange("shortName", companyToEdit.shortName.trim());
        this.props.onchange("localName", companyToEdit.localName.trim());
        return new Promise(
            (resolve, reject) => {
                if(this.state.showUpdateList && this.updateList.hasPendingItems()){
                    Notify.showError("Please complete all items in update list");
                    reject();
                    return;
                }
                if(!this.form.validate()) {
                    Notify.showError("There are validation problems");
                    reject();
                    return;
                }
                this.setState({busy: true});
                CompanyService.validateCompany(this.props.companyToEdit).then(response => {
                    resolve(true);
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                    reject();
                });
            }
        );
    }

    handleChange(key, value){
        if(key=="taxId"){
            value=value.trim();
        }
        this.props.onchange && this.props.onchange(key, value);
    }
    handleChangeCountry(value){
        this.props.onCountryChange && this.props.onCountryChange(value);
    }

    updateLogoUrl(value){
        this.props.onLogoUpdate && this.props.onLogoUpdate(value);
    }

    handleSearchLogoClick(e){
        e.preventDefault();
        this.logoModal.open();
    }

    handleVerifyEORIClick(){
        let companyToEdit = this.props.companyToEdit;

        if (_.isNil(companyToEdit.eoriNumber) || _.toString(companyToEdit.eoriNumber).trim().length == 0) {
            Notify.showError("Please enter an EORI number.");
            return;
        }
        let params = {eori: companyToEdit.eoriNumber};
        LookupService.verifyEORINumber(params).then(response => {
            if(response.data.status != "success"){
                Notify.showError(params.eori + " is not a valid EORI number");
              
            }
            this.setState({eoriNumberVerificationResult: response.data});
            
        }).catch(error => {
            Notify.showError(error);
        });       
    }

    handleTaxVerification(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    generateShortName(){
        if(!this.props.companyToEdit.name){
            return;
        }
        CompanyService.generateShortName(this.props.companyToEdit.id, this.props.companyToEdit.name).then(response => {
            this.handleChange("shortName", response.data);
        }).catch(error => {
            Notify.showError(error);
        })

    }

    render(){
        let companyLogoUrl = baseResourceUrl + "/assets/img/logo-placeholder.png";
        let absoluteWebsiteUrl = "";
        if(!this.props.companyToEdit) {
            return <Loader title="Fetching company data"/>;
        }else if(this.state.busy){
            return <Loader title="Validating company"/>;
        }else{
            absoluteWebsiteUrl = this.props.companyToEdit.website;
            if(absoluteWebsiteUrl && absoluteWebsiteUrl.length > 4 && absoluteWebsiteUrl.substr(0,4) != "http"){
                absoluteWebsiteUrl = "http://" + this.props.companyToEdit.website;
            }
            if(this.props.companyToEdit.newLogoUrl){
                companyLogoUrl = this.props.companyToEdit.newLogoUrl;
            } else if(this.props.companyToEdit.logoFilePath){
                companyLogoUrl = baseResourceUrl + "/company-images/" + this.props.companyToEdit.logoFilePath;
            }
        }

        let eoriNumberVerificationResult= null;
        if(_.get(this.state.eoriNumberVerificationResult,'status') === 'success'){
            eoriNumberVerificationResult = 
            <Grid>
                <GridCell width= "1-1">
                    <CardHeader title = "Eori Number Verification" />
                </GridCell>
                <GridCell width="1-1" >
                    <Grid>
                        <GridCell width = "1-6">
                            <Span label="Eori Name" value={this.state.eoriNumberVerificationResult.eoriName} />
                        </GridCell>
                        <GridCell width = "1-6">
                            <Span label ="Address Name" value = {this.state.eoriNumberVerificationResult.addressName} />
                        </GridCell>
                        <GridCell width="1-6">
                            <Span label = "Street Number" value = {this.state.eoriNumberVerificationResult.streetNumber} />
                        </GridCell>
                        <GridCell width ="1-6">
                            <Span label ="Postal Code" value ={this.state.eoriNumberVerificationResult.postalCode} />
                        </GridCell>
                        <GridCell width ="1-6">
                            <Span label ="City" value ={this.state.eoriNumberVerificationResult.city} />
                        </GridCell>
                        <GridCell width ="1-6">
                            <Span label ="Country" value ={this.state.eoriNumberVerificationResult.countryCode} />
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>
        }

        let taxIdVerificationResult = null;
        if(this.state.taxIdVerificationResult){
            taxIdVerificationResult =
                <Grid>
                    <GridCell width="1-1">
                        <CardHeader title="Tax ID Verification"/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Grid>
                            <GridCell width="1-4">
                                <Span label="Tax Office" value={this.state.taxIdVerificationResult.taxOfficeCode}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Tax Id" value={this.state.taxIdVerificationResult.taxId}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Company Name" value={this.state.taxIdVerificationResult.companyName}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Active" value={this.state.taxIdVerificationResult.active ? 'Yes' : 'No'}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Sector" value={this.state.taxIdVerificationResult.sector}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>;
        }
        let tcknVerificationResult = null;
        if(this.state.tcknVerificationResult){
            tcknVerificationResult =
                <Grid>
                    <GridCell width="1-1">
                        <CardHeader title="TCKN Verification"/>
                    </GridCell>
                    <GridCell width="1-1" hidden = {!this.state.tcknVerificationResult}>
                        <Grid>
                            <GridCell width="1-4">
                                <Span label="Tax Office" value={this.state.tcknVerificationResult.taxOfficeCode}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Tax Id" value={this.state.tcknVerificationResult.taxId}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Company Name" value={this.state.tcknVerificationResult.companyName}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Active" value={this.state.tcknVerificationResult.active ? 'Yes' : 'No'}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="TCKN" value={this.state.tcknVerificationResult.citizenshipId}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <Span label="Sector" value={this.state.tcknVerificationResult.sector}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>;
        }
        let updateList = "";
        if(this.state.showUpdateList){
            updateList = <GridCell width="1-1">
                            <CompanyGeneralUpdateList ref = {(c) => this.updateList = c}
                                                      onupdate = {(items) => this.handleUpdateFromUpdateList(items)}
                                                      onundo = {(items) => this.handleUndoUpdateFromUpdateList(items)}
                                                      current = {this.props.companyToEdit}
                                                      updated = {this.props.companyToMerge}
                                                      original = {this.props.companyOriginal}/>
                        </GridCell>;
        }

        let taxOffice = this.taxOfficeConfigs[this.props.companyToEdit.country ? this.props.companyToEdit.country.iso : "DEFAULT"];
        if(!taxOffice){
            if(this.props.companyToEdit.country.euMember){
                taxOffice = this.taxOfficeConfigs.EU;
            }else{
                taxOffice = this.taxOfficeConfigs.DEFAULT;
            }
        }


        let locale = this.props.companyToEdit.country ? this.props.companyToEdit.country.language : null;
        return (
            <Card style={{backgroundColor:"white"}}>
                <Grid>
                    {updateList}
                    <GridCell width="1-1">
                        <CardHeader title="General Information"/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Form ref = {(c) => this.form = c}>
                            <Grid>
                                <GridCell width="1-6" noMargin = {true}>
                                    <a href="#" data-uk-tooltip="{pos:'bottom'}" title = {super.translate("Click to search logo")}
                                       onClick = {(e) => this.handleSearchLogoClick(e)} >
                                        <img src = {companyLogoUrl}/>
                                    </a>
                                </GridCell>
                                <GridCell width="5-6" noMargin = {true}>
                                    <Grid>
                                        <GridCell width="2-3">
                                            <TextInput label="Name" required = {true} uppercase = {{locale: locale}}
                                                       value = {this.props.companyToEdit.name}
                                                       onchange = {(value) => this.handleChange("name", value)}/>
                                        </GridCell>
                                        <GridCell width="1-3">
                                            <TextInput label="Short Name" required = {true} uppercase = {{locale: locale}}
                                                       value = {this.props.companyToEdit.shortName} maxLength={30}
                                                       onchange = {(value) => this.handleChange("shortName", value)}
                                                       button = {{style:"success",
                                                           label: super.translate("generate"),
                                                           onclick: () => {this.generateShortName()}}
                                                       }/>
                                        </GridCell>
                                        <GridCell width="2-3">
                                            <TextInput label="Local Name" required = {true} uppercase = {{locale: locale}}
                                                       value = {this.props.companyToEdit.localName}
                                                       onchange = {(value) => this.handleChange("localName", value)} />
                                        </GridCell>
                                        <GridCell width="1-3">
                                            <div className="uk-align-left">
                                                <Button label="Use Name" style = "success" flat={true}
                                                        onclick = {() => this.handleChange("localName", this.props.companyToEdit.name)}/>
                                            </div>
                                        </GridCell>
                                    </Grid>
                                </GridCell>


                                <GridCell width="1-2">
                                    <DropDown options = {this.state.countries} label="Country" required = {true} labelField = "countryName"
                                                  value = {this.props.companyToEdit.country} translate={true}
                                                  onchange = {(value) => this.handleChangeCountry(value)} />
                                </GridCell>
                                <GridCell width="1-2">
                                    <Grid>
                                        <GridCell width="5-6" noMargin={true}>
                                            <TextInput label="Website" value = {this.props.companyToEdit.website} onchange = {(value) => this.handleChange("website", value)} />
                                        </GridCell>
                                        <GridCell width="1-6" noMargin={true} verticalAlign="bottom">
                                            <a href = {absoluteWebsiteUrl} target="_blank" >
                                                <i className="uk-icon uk-icon-external-link uk-icon-small uk-margin-top"/>
                                            </a>
                                        </GridCell>
                                    </Grid>

                                </GridCell>
                                <GridCell width="1-1">
                                    {React.cloneElement(taxOffice,
                                        {
                                            company: this.props.companyToEdit,
                                            onupdate: (key, value) => this.handleChange(key, value),
                                            onverify: (key, value) => this.handleTaxVerification(key, value)
                                        })
                                    }
                                </GridCell>

                                <GridCell width="1-4">
                                    <TextInput label="EORI Number"
                                                 value = {this.props.companyToEdit.eoriNumber} onchange = {(value) => this.handleChange("eoriNumber", value)} uppercase = {{locale: locale}}
                                                 pattern="/[a-zA-Z0-9]+/"
                                                 helperText="EORI number should be inserted by including country code as prefix! (Ex: HU0004104656)"
                                                 button = {{style:"success",
                                                     label: super.translate("verify"),
                                                     onclick: () => {this.handleVerifyEORIClick()}}
                                                 }/>         
                                </GridCell>
                                <GridCell width="3-4"/>
                            </Grid>
                        </Form>
                    </GridCell>
                    <GridCell width="1-1" >
                        {taxIdVerificationResult}
                    </GridCell>
                    <GridCell width="1-1" >
                        {tcknVerificationResult}
                    </GridCell>
                    <GridCell width="1-1" >
                        {eoriNumberVerificationResult}
                    </GridCell>
                </Grid>
                <LogoSearchModal searchText={this.props.companyToEdit.name} ref = {(c) => this.logoModal = c}
                                 onImageSelect = {(value) => this.updateLogoUrl(value)}/>
            </Card>
        );
    }
}

CompanyGeneral.contextTypes = {
    translator: PropTypes.object
};
