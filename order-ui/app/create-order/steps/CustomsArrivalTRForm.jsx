import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { DropDown, Notify } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import * as Customs from '../../Customs';
import { LocationService } from '../../services';
import { DefaultInactiveElement, handleTabPress } from './OrderSteps';

export class CustomsArrivalTRForm extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {data: {}};
        this.elementIdsForTabSequence = ["customsOffice","customsType","customsLocation" ,"customsAgent"];
        this.focusedElementId = null;
    }

    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
            this.focusOn("customsOffice");
        }
        if(this.props.value){
            this.setState({data: _.cloneDeep(this.props.value)}, () => this.loadCustomsLocations());
        }

    }
    componentWillReceiveProps(nextProps){
        if(nextProps.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {

        handleTabPress(e, () => this.focusNext(), () => this.focusPrev());
    };
    focusNext(){
        if(!this.focusedElementId){
            this.focusOn(this.elementIdsForTabSequence[0]);
        }else{
            let nextIndex = this.elementIdsForTabSequence.findIndex(item => item === this.focusedElementId) + 1;
            if(nextIndex >= this.elementIdsForTabSequence.length){
                this.props.onNext();
            }else{
                this.focusOn(this.elementIdsForTabSequence[nextIndex]);
            }
        }
    }
    focusPrev(){
        if(!this.focusedElementId){
            this.focusOn(this.elementIdsForTabSequence[0]);
        }else{
            let prevIndex = this.elementIdsForTabSequence.findIndex(item => item === this.focusedElementId) - 1;
            if(prevIndex < 0){
                this.props.onPrev();
            }else{
                this.focusOn(this.elementIdsForTabSequence[prevIndex]);
            }
        }
    }
    focusOn(elementId){
        let element = document.getElementById(elementId);
        if(element){
            element.focus();
        }
        this.focusedElementId = elementId;
    }

    updateStateAndLoadCustomsLocations(key, value){
        let data = _.cloneDeep(this.state.data);
        data[key] = value;
        this.setState({data: data}, () => {
            this.loadCustomsLocations();
        });
    }
    updateStateAndCallNext(key, value){
        let data = _.cloneDeep(this.state.data);
        data[key] = value;
        this.setState({data: data}, () => {
            this.checkFormFilledAndCallNext();
        });
    }
    updateCustomsLocation(value){
        let data = _.cloneDeep(this.state.data);
        if(value){
            data.customsLocation = {
                id: value.id,
                name: value.name,
                dangerousGoods: value.usedForDangerousGoods,
                temperatureControlledGoods: value.usedForTempControlledGoods
            };
        }else{
            data.customsLocation = null;
        }
        this.setState({data: data}, () => {
            this.checkFormFilledAndCallNext();
        });
    }
    checkFormFilledAndCallNext(){
        let {customsType, customsOffice, customsAgent, customsLocation} = this.state.data;
        if(customsOffice && customsAgent && customsType && (Customs.isCustomsTypeFreeZone(customsType) || customsLocation)){
            let data = _.cloneDeep(this.state.data);
            data._key = uuid.v4();
            this.props.onChange && this.props.onChange(data);
            this.props.onNext && this.props.onNext();
        }
    }
    loadCustomsLocations() {
        let {customsType, customsOffice} = this.state.data;
        if (customsOffice && customsType && !Customs.isCustomsTypeFreeZone(customsType)) {
                LocationService.searchCustomsLocations(
                    customsOffice.id, Customs.getCustomsWarehouseType(customsType),
                    Customs.isCustomsTypeNeedsLoadTypeCheck(customsType) && this.props.hasDangerousGoods ? true : null,
                    Customs.isCustomsTypeNeedsLoadTypeCheck(customsType) && this.props.hasTempControlledGoods ? true : null,
                    Customs.isCustomsTypeOnBoardClearance(customsType) ? true : null)
                    .then(response => {
                        this.setState({locations: response.data});
                    }).catch(error => Notify.showError(error));
        }
    }
    render(){
        return this.props.active ? this.renderActive() : this.renderInactive();
    }

    renderInactive(){
        if(!this.props.value){
            return <DefaultInactiveElement value="No selection" />;
        }
        return null;
    }
    renderActive(){
        let customsLocation = <DropDown id = "customsLocation" label = "Customs Location" required = {true}
                                        options = {this.state.locations}
                                        value = {this.state.data.customsLocation}
                                        emptyText = "No locations matching criteria..." uninitializedText = "Select customs office and type..."
                                        onchange = {value => this.updateCustomsLocation(value)} />;
        if(Customs.isCustomsTypeFreeZone(this.state.data.customsType)){
            customsLocation = null;
        }
        return(
            <Grid>
                <GridCell width = "1-2">
                    <DropDown id = "customsOffice" label = "Customs Office" required = {true}
                              options = {this.props.customsOffices} 
                              value = {this.state.data.customsOffice}
                              onchange = {value => this.updateStateAndLoadCustomsLocations("customsOffice", value)} />
                </GridCell>
                <GridCell width = "1-2">
                    <DropDown id = "customsType" label = "Customs Type" required = {true}
                              options = {this.props.customsTypes} value = {this.state.data.customsType} translate={true}
                              onchange = {value => this.updateStateAndLoadCustomsLocations("customsType", value)} />
                </GridCell>
                <GridCell width = "1-2">
                    {customsLocation}
                </GridCell>
                <GridCell width = "1-2">
                    <CompanySearchAutoComplete id = "customsAgent" label = "Customs Agent" required = {true}
                                               value = {this.state.data.customsAgent}
                                               onchange = {(value) => this.updateStateAndCallNext("customsAgent", value)} />
                </GridCell>
            </Grid>
        );

    }


}

CustomsArrivalTRForm.contextTypes = {
    translator: PropTypes.object
};