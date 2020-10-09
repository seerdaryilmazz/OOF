import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput } from 'susam-components/advanced';
import { Checkbox, DropDown, Form, Notify, Span, TextInput } from 'susam-components/basic';
import { CardHeader, Grid, GridCell } from "susam-components/layout";


export class CustomsDetails extends TranslatingComponent {


    updateCustomsDetails(key, value){
        let details = _.cloneDeep(this.props.details);
        details[key] = value;
        this.props.onChange(details);
    }
    updateCustomsType(value){
        let details = _.cloneDeep(this.props.details);
        if (value.id === "CUSTOMS_WAREHOUSE" || value.id === "CUSTOMER_CUSTOMS_WAREHOUSE" || value.id === "CUSTOMS_CLEARANCE_PARK" || value.id === "BONDED_WAREHOUSE") {
            let customsOffice = details.customsOffice || (this.isCompanyTypeCustoms(this.props) ? _.cloneDeep(this.props.company) : null);
            details = {
                customsType: value,
                customsOffice: customsOffice
            };
        } else {
            details = {
                customsType: value
            };
        }
        this.props.onChange(details);
    }
    updateCustomsOffice(value){
        let details = _.cloneDeep(this.props.details);
        details.customsOffice = value;
        this.props.onChange(details);
    }
    validate(){
        if(!this.form.validate()) {
            return false;
        }
        let {details} = this.props;
        let bondedWhCodeRegex = new RegExp('^A[0-9]{8}$');
        let customsWhCodeRegex = new RegExp('^G[0-9]{8}$');
        let customerCustomsWhCodeRegex = new RegExp('^C[0-9]{8}$');
        if(details.customsType.id === "EUROPE_CUSTOMS_LOCATION"){
            if(!details.europeanCustomsCode.startsWith(this.props.countryCode)){
                Notify.showError(`Customs code should start with '${this.props.countryCode}'`);
                return false;
            }
        } else if (details.customsType.id === "BONDED_WAREHOUSE") {
            if(details.warehouseCode && !bondedWhCodeRegex.test(details.warehouseCode)){
                Notify.showError("Bonded Warehouse code should start with 'A' followed by 8 numbers");
                return false;
            }
            if(details.dangerousGoodsCode && !bondedWhCodeRegex.test(details.dangerousGoodsCode)){
                Notify.showError("Bonded Warehouse code should start with 'A' followed by 8 numbers");
                return false;
            }
            if(details.tempControlledGoodsCode && !bondedWhCodeRegex.test(details.tempControlledGoodsCode)){
                Notify.showError("Bonded Warehouse code should start with 'A' followed by 8 numbers");
                return false;
            }
        } else if (details.customsType.id === "CUSTOMS_WAREHOUSE") {
            if(details.warehouseCode && !customsWhCodeRegex.test(details.warehouseCode)){
                Notify.showError("Bonded Warehouse code should start with 'G' followed by 8 numbers");
                return false;
            }
        } else if (details.customsType.id === "CUSTOMER_CUSTOMS_WAREHOUSE") {
            if(details.warehouseCode && !customerCustomsWhCodeRegex.test(details.warehouseCode)){
                Notify.showError("Bonded Warehouse code should start with 'C' followed by 8 numbers");
                return false;
            }
        }

        return true;

    }
    isCompanyTypeCustoms(props){
        return props.companyType && props.companyType.id === "CUSTOMS";
    }

    renderBondedWarehouseDetails(details){
        let tempControlledGoodsCode = null, dangerousGoodsCode = null;
        if(details.usedForDangerousGoods){
            dangerousGoodsCode = <TextInput label = "Bonded Warehouse Code for Dangerous Goods"
                                               mask = "'showMaskOnFocus':'true', 'mask':'A99999999', 'clearIncomplete': 'true'"
                                               helperText = "Code starts with 'A' and followed by 8 numbers"
                                               value = {details.dangerousGoodsCode}
                                               onchange = {value => this.updateCustomsDetails("dangerousGoodsCode", value)}/>;
        }
        if(details.usedForTempControlledGoods){
            tempControlledGoodsCode = <TextInput label = "Bonded Warehouse Code for Temperature Controlled Goods"
                                                  mask = "'showMaskOnFocus':'true', 'mask':'A99999999', 'clearIncomplete': 'true'"
                                                  helperText = "Code starts with 'A' and followed by 8 numbers"
                                                  value = {details.tempControlledGoodsCode}
                                                  onchange = {value => this.updateCustomsDetails("tempControlledGoodsCode", value)}/>;
        }
        return(
            <Grid>
                <GridCell width = "1-3">
                    <TextInput label = "Bonded Warehouse Code" mask = "'showMaskOnFocus':'true', 'mask':'A99999999', 'clearIncomplete': 'true'"
                               value = {details.warehouseCode}
                               helperText = "Code starts with 'A' and followed by 8 numbers"
                               onchange = {value => this.updateCustomsDetails("warehouseCode", value)}/>
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Checkbox label = "On-board customs clearance"
                                  value = {details.onBoardCustomsClearance}
                                  onchange = {value => this.updateCustomsDetails("onBoardCustomsClearance", value)} />
                    </div>
                </GridCell>
                <GridCell width = "1-3"/>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Checkbox label = "Can be used for dangerous goods"
                                  value = {details.usedForDangerousGoods}
                                  onchange = {value => this.updateCustomsDetails("usedForDangerousGoods", value)} />
                    </div>
                </GridCell>
                <GridCell width = "1-3">
                    {dangerousGoodsCode}
                </GridCell>
                <GridCell width = "1-3" />
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Checkbox label = "Can be used for temperature controlled goods"
                                  value = {details.usedForTempControlledGoods}
                                  onchange = {value => this.updateCustomsDetails("usedForTempControlledGoods", value)} />
                    </div>
                </GridCell>
                <GridCell width = "1-3">
                    {tempControlledGoodsCode}
                </GridCell>
                <GridCell width = "1-3" />
            </Grid>
        );
    }
    renderCustomsWarehouseDetails(details){
        return(
            <Grid>
                <GridCell width = "1-3">
                    <TextInput label = "Customs Warehouse Code"
                               mask = "'showMaskOnFocus':'true', 'mask':'A99999999', 'clearIncomplete': 'true'"
                               helperText = "Code starts with 'G' and followed by 8 numbers"
                               value = {details.warehouseCode}
                               onchange = {value => this.updateCustomsDetails("warehouseCode", value)}/>
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Checkbox label = "Can be used for dangerous goods"
                                  value = {details.usedForDangerousGoods}
                                  onchange = {value => this.updateCustomsDetails("usedForDangerousGoods", value)} />
                    </div>
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Checkbox label = "Can be used for temperature controlled goods"
                                  value = {details.usedForTempControlledGoods}
                                  onchange = {value => this.updateCustomsDetails("usedForTempControlledGoods", value)} />
                    </div>
                </GridCell>
            </Grid>
        );

    }
    renderCustomerCustomsWarehouseDetails(details){
        return(
            <Grid>
                <GridCell width = "1-3">
                    <TextInput label = "Customer Customs Warehouse Code"
                               mask = "'showMaskOnFocus':'true', 'mask':'A99999999', 'clearIncomplete': 'true'"
                               helperText = "Code starts with 'C' and followed by 8 numbers"
                               value = {details.warehouseCode}
                               onchange = {value => this.updateCustomsDetails("warehouseCode", value)}/>
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Checkbox label = "Can be used for dangerous goods"
                                  value = {details.usedForDangerousGoods}
                                  onchange = {value => this.updateCustomsDetails("usedForDangerousGoods", value)} />
                    </div>
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Checkbox label = "Can be used for temperature controlled goods"
                                  value = {details.usedForRefrigeratedGoods}
                                  onchange = {value => this.updateCustomsDetails("usedForRefrigeratedGoods", value)} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
    renderCustomsClearanceParkDetails(details){
        return(
            <Grid>
                <GridCell width = "1-3">
                    <TextInput label = "Customs Clearance Park Code"
                               value = {details.warehouseCode}
                               onchange = {value => this.updateCustomsDetails("warehouseCode", value)}/>
                </GridCell>
            </Grid>
        );
    }

    updateExternalIds(value){
        this.props.onExternalIdsChange && this.props.onExternalIdsChange(value);
    }

    render(){
        let details = this.props.details;
        if(!details){
            return null;
        }

        let customsOffice = null;
        let customsCode = null;
        let warehouseDetails = null;
        let externalSystemCode = null;
        if(details.customsType){
            if(details.customsType.id !== "NON_BONDED_WAREHOUSE" && details.customsType.id !== "EUROPE_CUSTOMS_LOCATION") {
                customsCode = <Span label="Customs Code" value={details.customsOffice ? details.customsOffice.customsCode : ""}/>;
                customsOffice = <DropDown label="Customs Office" required={true} readOnly = {this.isCompanyTypeCustoms(this.props)}
                                          options={this.props.customsOffices}
                                          value={details.customsOffice}
                                          onchange={value => this.updateCustomsOffice(value)}/>;
                externalSystemCode = <NumberInput label="External Customs Location Code" uppercase = {true}
                                            value={_.get(_.find(this.props.externalIds,{externalSystem:'QUADRO'}), 'externalId')}
                                            onchange={(value) => this.updateExternalIds(value ?[{externalSystem:'QUADRO', externalId: value}]:[])}
                                            maxLength = "3"/>

                if (details.customsType.id === "BONDED_WAREHOUSE") {
                    warehouseDetails = this.renderBondedWarehouseDetails(details);
                } else if (details.customsType.id === "CUSTOMS_WAREHOUSE") {
                    warehouseDetails = this.renderCustomsWarehouseDetails(details);
                } else if (details.customsType.id === "CUSTOMER_CUSTOMS_WAREHOUSE") {
                    warehouseDetails = this.renderCustomerCustomsWarehouseDetails(details);
                } else if (details.customsType.id === "CUSTOMS_CLEARANCE_PARK") {
                    warehouseDetails = this.renderCustomsClearanceParkDetails(details);
                }
            }else if(details.customsType.id === "EUROPE_CUSTOMS_LOCATION"){
                customsCode = <TextInput label="Customs Code" required={true} uppercase = {true}
                                         helperText = {`Code starts with '${this.props.countryCode}'`}
                                         value={details.europeanCustomsCode}
                                         onchange = {value => this.updateCustomsDetails("europeanCustomsCode", value)}/>;
            }
        }
        return(
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width="1-1">
                        <CardHeader title="Customs Details"/>
                    </GridCell>
                    <GridCell width="1-3">
                        <DropDown label="Customs Type" options = {this.props.customsTypes} required = {true}
                                  value = {details && details.customsType}
                                  onchange = {value => this.updateCustomsType(value)} />
                    </GridCell>
                    <GridCell width="1-3">
                        {customsOffice}
                    </GridCell>
                    <GridCell width="1-3">
                        {customsCode}
                    </GridCell>
                    <GridCell width="1-1">
                        {warehouseDetails}
                    </GridCell>
                    <GridCell width="1-3">
                        {externalSystemCode}
                    </GridCell>
                </Grid>
            </Form>
        );

    }
}