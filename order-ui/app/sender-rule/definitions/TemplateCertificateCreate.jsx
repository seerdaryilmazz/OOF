import _ from "lodash";
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from "susam-components/advanced";
import { Button, DropDown, Notify, RadioButton } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { LocationService, OrderService } from "../../services";
import { SenderTemplateSenderLocations } from "../SenderTemplateSenderLocations";

export class TemplateCertificateCreate extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {certificateTypes:[], borderCustoms:[]};
        this.getHealthCertificates();
        this.getBorderCustoms();
    }

    getHealthCertificates(){
        OrderService.getHealthCertificateTypes().then(response => {
            let certificateTypes = response.data.map(certificateType => {
                return {code:certificateType.code, name: certificateType.name};
            });
            this.updateState("certificateTypes", certificateTypes);
        }).catch(error => Notify.showError(error));
    }

    getBorderCustoms(){
        LocationService.getBorderCustoms().then(response => {
            this.updateState("borderCustoms", response.data)
        }).catch(error => Notify.showError(error));
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    updateShouldCertificatedGoodsBeAsked(value, valueToSet){
        this.props.onChange("shouldCertificatedGoodsBeAsked", valueToSet)
        if(!valueToSet){
            this.props.onChange("healthCertificates", []);
            this.updateShouldHealthCheckBeAsked(true, false);
        }
    }

    updateShouldHealthCheckBeAsked(value, valueToSet){
        this.props.onChange("shouldHealthCheckBeAsked", valueToSet)
        if(!valueToSet){
            this.props.onChange("borderCustoms", []);
        }
    }

    handleAddClick(){

        if(!this.state.selectedBorderCustom){
            Notify.showError("Please select a border")
        }else if(_.findIndex(this.props.templateCertificate.borderCustoms, {id: this.state.selectedBorderCustom.id})!=-1){
            Notify.showError("Same border exists")
        }else{
            let template = _.cloneDeep(this.props.templateCertificate);
            if (!template.borderCustoms) {
                template.borderCustoms = [];
            }
            template.borderCustoms.push({id:this.state.selectedBorderCustom.id, name:this.state.selectedBorderCustom.name});

            this.setState({selectedBorderCustom: {}});
            this.props.onChange("borderCustoms", template.borderCustoms);

        }

    }

    handleDeleteClick(borderCustom){
        Notify.confirm("Are you sure?", () => {
            let template = _.cloneDeep(this.props.templateCertificate);
            _.remove(template.borderCustoms, item => item.id === borderCustom.id);
            this.props.onChange && this.props.onChange("borderCustoms", template.borderCustoms);
        });
    }

    renderBorderPart(){
        if(!this.props.templateCertificate.shouldHealthCheckBeAsked){
            return null;
        }
        let list = <div>{super.translate("There is no selected border")}</div>;
        if(this.props.templateCertificate.borderCustoms && this.props.templateCertificate.borderCustoms.length > 0 ) {
            list = <ul className = "md-list">
                {this.props.templateCertificate.borderCustoms.map(item => {
                    return(
                        <li key = {item.id}>
                            <Grid>
                                <GridCell width = "2-5">
                                    {item.name}
                                </GridCell>
                                <GridCell width = "1-5">
                                    <Button label = "delete" flat = {true} size = "small" style = "danger"
                                            onclick = {() => this.handleDeleteClick(item)} />
                                </GridCell>
                            </Grid>
                        </li>
                    );
                })}
            </ul>;
        }

        return(
            <Grid>
                <GridCell width="3-5">
                        <span className="uk-text-large uk-text-bold uk-text-primary">
                            {super.translate("Border Crossing Options")}
                        </span>
                </GridCell>
                <GridCell width = "3-5">
                    <DropDown id = {this.id} options = {this.state.borderCustoms} value = {this.state.selectedBorderCustom}
                          onchange = {(value) => this.updateState("selectedBorderCustom",value)} />
                </GridCell>
                <GridCell width="1-10">
                    <div className = "uk-margin-top">
                        <Button label="add" size="small" style="success" waves = {true} onclick = {() => this.handleAddClick()}/>
                    </div>
                </GridCell>

                <GridCell width="1-1">
                    {list}
                </GridCell>
            </Grid>

        );

    }

    renderDocumentPart(){
        if(!this.props.templateCertificate.shouldCertificatedGoodsBeAsked){
            return null;
        }
        return(
                <Grid>
                    <GridCell width="3-5">
                        <span className="uk-text-large uk-text-bold uk-text-primary">
                            {super.translate("Document Types")}
                        </span>
                    </GridCell>
                    <GridCell width = "2-5"/>
                    <GridCell width = "3-5">
                        <Chip options = {this.state.certificateTypes} id = "document-type" placeholder = "Documents"
                              valueField = "code"
                              value = {this.props.templateCertificate.healthCertificates}
                              onchange = {(value) => this.props.onChange("healthCertificates",value)} />
                    </GridCell>
                    <GridCell width = "2-5"/>
                    <GridCell width="3-5">
                        <span className="uk-text-large uk-text-bold uk-text-primary">
                            {super.translate("Health Check at Border Crossing")}
                        </span>
                    </GridCell>
                    <GridCell width = "2-5"/>
                    <GridCell width="1-1">
                        <RadioButton label="Should Be Asked" inline={true}
                                     name="shouldHealthCheckBeAsked"
                                     checked={this.props.templateCertificate.shouldHealthCheckBeAsked == true}
                                     onchange={(value) => this.updateShouldHealthCheckBeAsked(value, true)} />
                        <RadioButton label="No Health Check" inline={true}
                                     name="shouldHealthCheckBeAsked"
                                     checked={this.props.templateCertificate.shouldHealthCheckBeAsked == false}
                                     onchange={(value) => this.updateShouldHealthCheckBeAsked(value, false)} />
                    </GridCell>
                    <GridCell/>

                    <GridCell width="1-1">
                        {this.renderBorderPart()}
                    </GridCell>
                </Grid>

        );
    }

    renderTemplateCertificate(){
        if(!this.props.templateCertificate){
            return null;
        }

        return (
            <Grid>
                <GridCell width = "1-3">
                    <CompanySearchAutoComplete label = "Sender" value = {this.props.templateCertificate.sender} required = {true}
                                                readOnly = {this.props.readOnly} onchange = {(value) => this.props.onChange("sender", value)} />
                </GridCell>
                <GridCell width = "1-1">
                    <SenderTemplateSenderLocations template = {this.props.templateCertificate}
                                                   onChange = {(value) => this.props.onChange("senderLocations", value)}/>
                </GridCell>
                <GridCell width="1-3">
                    <span className="uk-text-large uk-text-bold uk-text-primary">
                        {super.translate("Certificated Goods")}
                    </span>
                </GridCell>
                <GridCell width="1-1">
                    <RadioButton label="Should Be Asked" inline={true}
                                 name="shouldCertificatedGoodsBeAsked"
                                 checked={this.props.templateCertificate.shouldCertificatedGoodsBeAsked == true}
                                 onchange={(value) => this.updateShouldCertificatedGoodsBeAsked(value, true)} />
                    <RadioButton label="Packages Do NOT Contain" inline={true}
                                 name="shouldCertificatedGoodsBeAsked"
                                 checked={this.props.templateCertificate.shouldCertificatedGoodsBeAsked == false}
                                 onchange={(value) => this.updateShouldCertificatedGoodsBeAsked(value, false)} />
                </GridCell>

                <GridCell>
                    {this.renderDocumentPart()}
                </GridCell>
                <GridCell width = "1-1">
                    <div className="uk-align-left">
                        <Button label="cancel" size = "small"
                                onclick = {() => this.props.handleCancelTemplate()} />
                    </div>
                    <div className="uk-align-right">
                        <Button label="save template" style = "primary" size = "small"
                                onclick = {() => this.props.handleSaveTemplate()} />
                    </div>
                </GridCell>

            </Grid>
        );
    }


    render(){
        let senderName = this.props.templateCertificate.sender ? this.props.templateCertificate.sender.name : "";
        return(
            <div>
                <PageHeader title={`${super.translate("Sender Template")}: ${senderName}`} />
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            {this.renderTemplateCertificate()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}

TemplateCertificateCreate.contextTypes = {
    translator: PropTypes.object
};