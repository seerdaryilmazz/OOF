import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { ProjectService } from "../services";
import { TemplateAdrDetailCreate } from "./definitions/TemplateAdrDetailCreate";
import { TemplateCertificateCreate } from "./definitions/TemplateCertificateCreate";
import { TemplateFrigoCreate } from "./definitions/TemplateFrigoCreate";
import { TemplateGoodsCreate } from "./definitions/TemplateGoodsCreate";
import { TemplatePackageCreate } from "./definitions/TemplatePackageCreate";
import { TemplateAdrDetailValidator } from "./validators/TemplateAdrDetailValidator";
import { TemplateCertificateValidator } from "./validators/TemplateCertificateValidator";
import { TemplateFrigoValidator } from "./validators/TemplateFrigoValidator";
import { TemplatePackageValidator } from "./validators/TemplatePackageValidator";

export class SenderTemplateCreate extends TranslatingComponent {

    constructor(props){
        super(props);
        let template = _.cloneDeep(this.props.template);

        if(template.templateCertificate){
            template.templateCertificate.shouldCertificatedGoodsBeAsked = template.templateCertificate.shouldCertificatedGoodsBeAsked || false;
            template.templateCertificate.shouldHealthCheckBeAsked = template.templateCertificate.shouldHealthCheckBeAsked || false;
        }
        this.state = {
                        templatePackage: template.templatePackage,
                        templateAdrDetail: template.templateAdrDetail,
                        templateFrigo: template.templateFrigo,
                        templateCertificate: template.templateCertificate,
                        adrClassDetails: template.adrClassDetails,
                        templateGoods: template.templateGoods
                    };
    }



    handleSaveTemplatePackage(){
        let result = TemplatePackageValidator.validate(this.state.templatePackage)
        if(!result) {
            ProjectService.saveTemplatePackage(this.state.templatePackage).then(response => {
                Notify.showSuccess("Package definition saved");
                let updateState = {"template":null, "isCreate":false, "sender":response.data.sender};
                this.props.handleSave(updateState);

            }).catch(error => {
                Notify.showError(error);
            });
        }else{
            Notify.showError(result);
        }
    }

    handleUpdateTemplatePackage(key, value){
        let templatePackage = _.cloneDeep(this.state.templatePackage);
        templatePackage[key] = value;
        this.setState({templatePackage: templatePackage});
    }

    handleSaveTemplateAdrDetail(){
        let result = TemplateAdrDetailValidator.validate(this.state.templateAdrDetail)
        if(!result) {
            ProjectService.saveTemplateAdrDetail(this.state.templateAdrDetail).then(response => {
                Notify.showSuccess("Dangerous Goods definition saved");
                let updateState = {"template":null, "isCreate":false, "sender":response.data.sender};
                this.props.handleSave(updateState);
            }).catch(error => {
                Notify.showError(error);
            });
        }else{
            Notify.showError(result);
        }
    }

    handleUpdateTemplateAdrDetail(key, value){
        let templateAdrDetail = _.cloneDeep(this.state.templateAdrDetail);
        templateAdrDetail[key] = value;
        this.setState({templateAdrDetail: templateAdrDetail});
    }

    handleSaveTemplateFrigo(){
        let result = TemplateFrigoValidator.validate(this.state.templateFrigo)
        if(!result) {
            ProjectService.saveTemplateFrigo(this.state.templateFrigo).then(response => {
                Notify.showSuccess("Temperature Controlled Goods definition saved");
                let updateState = {"template":null, "isCreate":false, "sender":response.data.sender};
                this.props.handleSave(updateState);
            }).catch(error => {
                Notify.showError(error);
            });
        }else{
            Notify.showError(result);
        }
    }

    handleUpdateTemplateFrigo(key, value){
        let templateFrigo = _.cloneDeep(this.state.templateFrigo);
        templateFrigo[key] = value;
        this.setState({templateFrigo: templateFrigo});
    }

    handleSaveTemplateCertificate(){
        let result = TemplateCertificateValidator.validate(this.state.templateCertificate)
        if(!result) {
            ProjectService.saveTemplateCertificate(this.state.templateCertificate).then(response => {
                Notify.showSuccess("Certificated Goods definition saved");
                let updateState = {"template":null, "isCreate":false, "sender":response.data.sender};
                this.props.handleSave(updateState);
            }).catch(error => {
                Notify.showError(error);
            });
        }else{
            Notify.showError(result);
        }
    }
    
    handleSaveTemplateGoods(){
        let result = TemplateCertificateValidator.validate(this.state.templateGoods)
        if(!result) {
            ProjectService.saveTemplateGoods(this.state.templateGoods).then(response => {
                Notify.showSuccess("Definition of Goods is saved");
                let updateState = {"template":null, "isCreate":false, "sender":response.data.sender};
                this.props.handleSave(updateState);
            }).catch(error => {
                Notify.showError(error);
            });
        }else{
            Notify.showError(result);
        }
    }

    handleUpdateTemplateCertificate(key, value){
        let templateCertificate = _.cloneDeep(this.state.templateCertificate);
        templateCertificate[key] = value;
        this.setState({templateCertificate: templateCertificate});
    }
    
    handleUpdateTemplateGoods(key, value){
        let templateGoods = _.cloneDeep(this.state.templateGoods);
        templateGoods[key] = value;
        this.setState({templateGoods: templateGoods});
    }

    render(){
        if(!this.props.templateType){
            return null;
        }
        if(this.props.templateType === "Package") {
            return (
                <TemplatePackageCreate  templatePackage = {this.state.templatePackage}
                                        readOnly = {this.props.readOnly}
                                        packageType = {this.props.packageTypes}
                                        onChange = {(key, value) => this.handleUpdateTemplatePackage(key, value)}
                                        handleCancelTemplate = {() => this.props.handleCancelTemplate(this.state.templatePackage.sender)}
                                        handleSaveTemplate = {() => this.handleSaveTemplatePackage() }/>
            );
        }

        if(this.props.templateType === "ADR") {
            return (
                <TemplateAdrDetailCreate    templateAdrDetail = {this.state.templateAdrDetail}
                                            readOnly = {this.props.readOnly}
                                            selectedADRs = {this.state.adrClassDetails}
                                            onChange = {(key, value) => this.handleUpdateTemplateAdrDetail(key, value)}
                                            handleCancelTemplate = {() => this.props.handleCancelTemplate(this.state.templateAdrDetail.sender)}
                                            handleSaveTemplate = {() => this.handleSaveTemplateAdrDetail() }/>
            );
        }

        if(this.props.templateType === "Frigo") {
            return (
                <TemplateFrigoCreate    templateFrigo = {this.state.templateFrigo}
                                        readOnly = {this.props.readOnly}
                                        onChange = {(key, value) => this.handleUpdateTemplateFrigo(key, value)}
                                        handleCancelTemplate = {() => this.props.handleCancelTemplate(this.state.templateFrigo.sender)}
                                        handleSaveTemplate = {() => this.handleSaveTemplateFrigo() }/>
            );
        }


        if(this.props.templateType === "Certificate") {
            return (
                <TemplateCertificateCreate  templateCertificate = {this.state.templateCertificate}
                                            readOnly = {this.props.readOnly}
                                            onChange = {(key, value) => this.handleUpdateTemplateCertificate(key, value)}
                                            handleCancelTemplate = {() => this.props.handleCancelTemplate(this.state.templateCertificate.sender)}
                                            handleSaveTemplate = {() => this.handleSaveTemplateCertificate() }/>
            );
        }

        if(this.props.templateType === "Goods") {
            return (
                <TemplateGoodsCreate    templateGoods={this.state.templateGoods}
                                        readOnly = {this.props.readOnly}
                                        selectedHSCodes={[]}
                                        onChange={(key, value) => this.handleUpdateTemplateGoods(key, value)}
                                        handleCancelTemplate={() => this.props.handleCancelTemplate(this.state.templateGoods.sender)}
                                        handleSaveTemplate={() => this.handleSaveTemplateGoods()} />
            );
        }
    }

}

SenderTemplateCreate.contextTypes = {
    router: React.PropTypes.object.isRequired
};