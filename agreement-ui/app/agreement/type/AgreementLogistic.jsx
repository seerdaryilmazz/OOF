import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import { PageHeader } from 'susam-components/layout';
import { CommonInfo, KpiInfoList, OwnerInfoList, FinancialInfo, LetterOfGuarenteeList, LegalInfo, SignatureInfoList, InsuranceInfoList, PriceAdaptationModelList, UnitPriceList } from "../index";
import {AgreementUtils} from "../../utils/AgreementUtils";
import {StringUtils} from "../../utils";

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
        AgreementUtils.applyKeyValuePairsToAgreement(keyValuePairs, agreement);
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
        let agreementNumberSuffix = !_.isNil(this.props.agreement.number) ? " - " + StringUtils.numberPrint(this.props.agreement.number) : "";
        return(
            <PageHeader title={super.translate("Agreement") + agreementNumberSuffix}/>
        );
    }

    render() {
        return(
            <div>
                {this.renderPageHeader()}
                <CommonInfo ref={c => this.agreementCommonInfo = c}
                            agreement={this.props.agreement}
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
                {this.renderInsuranceInfoList()}
                {this.renderPriceAdaptationModelList()}
                {this.renderUnitPriceList()}
                <LegalInfo ref={c => this.legalInfoForm = c}
                           legalInfo={this.props.agreement.legalInfo || {}}
                           onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                           readOnly={this.props.readOnly}/>
                <SignatureInfoList agreement={this.props.agreement}
                                   onChange={(keyValuePairs) => this.handleChange(keyValuePairs)}
                                   readOnly={this.props.readOnly}/>
            </div>
        );
    }
}