import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import { convertLocationsWithPostalCodes } from '../../Helper';
import { Kartoteks } from '../../services';
import { DefaultInactiveElement, handleTabPress } from './OrderSteps';



export class ManufacturerForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.elementIdsForTabSequence = ["manufacturerCompany", "manufacturerLocation", "manufacturerContact"];
        this.focusedElementId = this.elementIdsForTabSequence[0];
    }

    filterContactsByLocation(contacts, location) {
        return _.filter(contacts, c => c.companyLocation.id === location.id).map(c => { return { id: c.id, name: c.firstName + " " + c.lastName } })
    }

    componentDidMount() {
        if (this.props.active) {
            document.addEventListener('keyup', this.handleKeyPress);
            this.focusOn(this.focusedElementId );
            if(this.props.value){
                this.setState(this.props.value);
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.active) {
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount() {
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        handleTabPress(e, () => this.focusNext(), () => this.focusPrev());
    };
    focusNext() {
        if (!this.focusedElementId) {
            this.focusOn(this.elementIdsForTabSequence[0]);
        } else {
            let nextIndex = this.elementIdsForTabSequence.findIndex(item => item === this.focusedElementId) + 1;
            if (nextIndex >= this.elementIdsForTabSequence.length) {
                this.props.onNext();
            } else {
                this.focusOn(this.elementIdsForTabSequence[nextIndex]);
            }
        }
    }
    focusPrev() {
        if (!this.focusedElementId) {
            this.focusOn(this.elementIdsForTabSequence[0]);
        } else {
            let prevIndex = this.elementIdsForTabSequence.findIndex(item => item === this.focusedElementId) - 1;
            if (prevIndex < 0) {
                this.props.onPrev();
            } else {
                this.focusOn(this.elementIdsForTabSequence[prevIndex]);
            }
        }
    }
    focusOn(elementId) {
        var element = document.getElementById(elementId);
        if(element){
            $("#"+elementId).focus().select();
            this.focusedElementId = elementId;
            console.log("focusOn",this.focusedElementId);
        }
    }

    handleCompanyChange(value) {
        if (value) {
            Kartoteks.getCompanyLocations(value.id).then(response => {
                let state = _.cloneDeep(this.state);
                _.set(state, '_key', uuid.v4());

                _.set(state, 'company', value);
                _.set(state, 'companyLocation', null);
                _.set(state, 'companyContact', null);

                _.set(state, 'locations', response.data.map(item => convertLocationsWithPostalCodes(item)));

                this.setState(state, () => {
                    this.props.onChange && this.props.onChange(this.state);
                    this.focusOn(this.elementIdsForTabSequence[1]);
                    if (this.state.locations && 1 === this.state.locations.length) {
                        this.handleLocationChange(_.first(this.state.locations));
                    }
                });
            });
        } else {
            this.setState({ locations: null });
        }
    }
    handleLocationChange(value) {
        if (value) {
            Kartoteks.getCompanyContacts(this.state.company.id).then(response => {
                let state = _.cloneDeep(this.state);
                _.set(state, 'companyLocation', value);
                _.set(state, 'companyContact', null);
                
                _.set(state, 'contacts', this.filterContactsByLocation(response.data, value));
                
                this.setState(state, () => {
                    this.props.onChange && this.props.onChange(this.state)
                    this.focusOn(this.elementIdsForTabSequence[2])
                    if (this.state.contacts && 1 == this.state.contacts.length) {
                        this.handleContactChange(_.first(this.state.contacts));
                    }
                });
            });
        } else {
            this.setState({ contacts: null });
        }
    }
    handleContactChange(value) {
        let state = _.cloneDeep(this.state);
        _.set(state, 'contact', value);
        this.setState(state, () => {
            if(value){
                this.props.onNext();
            }
            this.props.onChange && this.props.onChange(this.state);
        });
    }
    
    render() {
        return this.props.active ? this.renderActive() : this.renderInactive();
    }

    renderInactive() {
        if (!this.props.value) {
            return <DefaultInactiveElement value="No selection" />;
        }
        return null;
    }
    renderActive() {
        return (
            <Grid>
                <GridCell width="2-5">
                    <CompanySearchAutoComplete id="manufacturerCompany" label="Company" value={this.state.company}
                        required={true}  onchange={(value) => this.handleCompanyChange(value)} />
                </GridCell>
                <GridCell width="2-5">
                    <DropDown id="manufacturerLocation" label="Location" options={this.state.companyLocations}
                        emptyText="No locations..." uninitializedText="Select company..."
                        value={this.state.location} required={true}
                        onchange={(value) => this.handleLocationChange(value)}
                        onfocus={()=>this.focusOn('manufacturerLocation')} />
                </GridCell>
                <GridCell width="1-5">
                    <DropDown id="manufacturerContact" label="Contact" options={this.state.companyContacts} 
                        value={this.state.contact} onchange={(value) => this.handleContactChange(value)}
                        onfocus={()=>this.focusOn('manufacturerContact')} />
                </GridCell>

            </Grid>
        );

    }


}