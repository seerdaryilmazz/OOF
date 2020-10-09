import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import { PageHeader, Grid, GridCell } from 'susam-components/layout';
import { AgreementCommonInfo, KpiInfoList, OwnerInfoList, FinancialInfo, LetterOfGuarenteeList, LegalInfo, SignatureInfoList, InsuranceInfoList, PriceAdaptationModelList, UnitPriceList } from "../index";
import {StringUtils, ObjectUtils} from "../../utils";

export class AgreementLogistic extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    handleChangeGeneralInfo(data) {
        this.props.onChange(data);
    }

    handleChange(keyValuePairs) {
        let agreement = _.cloneDeep(this.props.agreement);
        ObjectUtils.applyKeyValuePairs(keyValuePairs, agreement);
        this.props.onChange(agreement);
    }

    validate() {
        return this.agreementCommonInfo.validate()
            && this.financialInfoForm.validate()
            && this.legalInfoForm.validate()
            && this.ownerInfoList.validate();
    }

    renderInsuranceInfoList(){
        if(_.find(this.props.agreement.serviceAreas, {'code': 'WHM'})){
            return (
                <InsuranceInfoList agreement={this.props.agreement}
                                   onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                                   readOnly={this.props.readOnly}/>
            );
        }
    }

    renderPriceAdaptationModelList(){
        if(_.find(this.props.agreement.serviceAreas, {'code': 'WHM'})){
            return (
                <PriceAdaptationModelList agreement={this.props.agreement}
                                          onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                                          readOnly={this.props.readOnly}/>
            );
        }
    }

    renderUnitPriceList(){
        if(_.find(this.props.agreement.serviceAreas, {'code': 'WHM'})){
            return (
                <UnitPriceList agreement={this.props.agreement}
                               onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                               readOnly={this.props.readOnly}/>
            );
        }
    }

    renderPageHeader() {
        let agreementNumber = !_.isNil(this.props.agreement.number) ? " - " + this.props.agreement.number : "";
        return(
            <GridCell noMargin={true} style={{paddingLeft:"10px",paddingTop:"10px",position:"fixed",zIndex:2, marginTop:"-54px", marginRight:"50px", background:"#eeeeee"}}>
                <PageHeader title={super.translate("Agreement") + agreementNumber}/>
            </GridCell>
        );
    }

    render() {
        return(
            <div>
                {this.renderPageHeader()}
                <AgreementCommonInfo ref={c => this.agreementCommonInfo = c}
                                     agreement={this.props.agreement}
                                     changes={this.props.changes}
                                     onChange={(data) => this.handleChangeGeneralInfo(data)}
                                     readOnly={this.props.readOnly}/>
                <KpiInfoList agreement={this.props.agreement}
                             onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                             readOnly={this.props.readOnly}/>
                <OwnerInfoList ref = {c => this.ownerInfoList = c}
                               agreement={this.props.agreement}
                               onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                               readOnly={this.props.readOnly}/>
                <FinancialInfo ref={c => this.financialInfoForm = c}
                               financialInfo={this.props.agreement.financialInfo || {}}
                               onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                               readOnly={this.props.readOnly}/>
                <LetterOfGuarenteeList agreement={this.props.agreement}
                                       onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                                       readOnly={this.props.readOnly}/>
                <LegalInfo ref={c => this.legalInfoForm = c}
                           legalInfo={this.props.agreement.legalInfo || {}}
                           onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                           readOnly={this.props.readOnly}/>
                <SignatureInfoList agreement={this.props.agreement}
                                   onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                                   readOnly={this.props.readOnly}/>
                {this.renderInsuranceInfoList()}
                {this.renderPriceAdaptationModelList()}
                {this.renderUnitPriceList()}
            </div>
        );
    }
}