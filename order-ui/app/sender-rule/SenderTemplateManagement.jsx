import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import uuid from 'uuid';
import { Kartoteks, OrderService, ProjectService } from '../services';
import { SenderTemplateCreate } from "./SenderTemplateCreate";
import { SenderTemplateList } from './SenderTemplateList';

export class SenderTemplateManagement extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {isCreate:false, adrClassDetails:{},type:this.props.location.query.type};
    }

    componentDidMount(){
        this.loadData();
        let sender = !_.isNil(this.props.location.query.sender) ? this.props.location.query.sender : null;
        let id = !_.isNil(this.props.location.query.id) ? this.props.location.query.id : null;
        let type = !_.isNil(this.props.location.query.type) ? this.props.location.query.type : null;
        this.init(id, type);
        if(sender){
            Kartoteks.getCompanyDetails(sender).then(response=>{
                this.setState({sender: {id: response.data.id, name: response.data.name, value: response.data.name}, readOnly: true});
            })
        } 
    }

    componentWillReceiveProps(nextProps){
        if(!_.isNil(nextProps.location.query.id) && !_.isNil(nextProps.location.query.type)){
            let id = nextProps.location.query.id;
            let type = nextProps.location.query.type;
            this.init(id, type);
        }

    }

    loadData(){
        OrderService.getPackageTypes().then(response => {
            let state = _.cloneDeep(this.state);
            state.packageTypes = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    init(id, type) {

        if (!_.isNil(id) && !_.isNil(type)) {
            switch(type){
                case "Package":
                    this.getTemplatePackage(id, (templatePackage) => {
                        let state = _.cloneDeep(this.state);
                        state["template"] = {templatePackage: templatePackage};
                        state["templateType"] = "Package";
                        state["isCreate"] = true;
                        this.setState(state);

                    });
                    break;
                case "ADR":
                    this.getTemplateAdrDetail(id, (templateAdrDetail) => {
                        let state = _.cloneDeep(this.state);
                        state["template"] = {templateAdrDetail: templateAdrDetail};
                        state["templateType"] = "ADR";
                        state["isCreate"] = true;
                        if(templateAdrDetail.unIds && templateAdrDetail.unIds.length > 0) {
                            this.getAdrClassDetails(templateAdrDetail.unIds, (templateAdrClassDetails) => {
                                state.template["adrClassDetails"] = templateAdrClassDetails;
                                this.setState(state);
                            });
                        }else{
                            state.template["adrClassDetails"] = null;
                            this.setState(state);
                        }
                    });
                    break;
                case "Certificate":
                    this.getTemplateCertificate(id, (templateCertificate) => {
                        let state = _.cloneDeep(this.state);
                        state["template"] = {templateCertificate: templateCertificate};
                        state["templateType"] = "Certificate";
                        state["isCreate"] = true;
                        this.setState(state);
                    });
                    break;
                case "Frigo":
                    this.getTemplateFrigo(id, (templateFrigo) => {
                        let state = _.cloneDeep(this.state);
                        state["template"] = {templateFrigo: templateFrigo};
                        state["templateType"] = "Frigo";
                        state["isCreate"] = true;
                        this.setState(state);
                    });
                    break;
                case "Goods":
                    this.getTemplateGoods(id, (templateGoods) => {
                        let state = _.cloneDeep(this.state);
                        state["template"] = {templateGoods: templateGoods};
                        state["templateType"] = "Goods";
                        state["isCreate"] = true;
                        this.setState(state);
                    });
                    break;
            }
        }
    }

    getTemplatePackage(id, callback){
        ProjectService.getTemplatePackage(id).then(response => {
            response.data.packageDetails.map(packageDetail => {
                packageDetail._key = uuid.v4();
            });
            response.data.senderLocations.map(senderLocation => {
                senderLocation._key = uuid.v4();
            });
            callback(response.data);
        }).catch(error=>{
           Notify.showError(error);
        });
    }

    getTemplateAdrDetail(id, callback){
        ProjectService.getTemplateAdrDetail(id).then(response => {
            response.data.senderLocations.map(senderLocation => {
                senderLocation._key = uuid.v4();
            });
            callback(response.data);
        }).catch(error=>{
            Notify.showError(error);
        });
    }

    getAdrClassDetails(ids, callback){
        OrderService.listAdrClassDetails(ids).then(response => {
            callback(response.data);
        }).catch(error=>{
            Notify.showError(error);
        });
    }

    getTemplateFrigo(id, callback){
        ProjectService.getTemplateFrigo(id).then(response => {
            response.data.senderLocations.map(senderLocation => {
                senderLocation._key = uuid.v4();
            });
            callback(response.data);
        }).catch(error=>{
            Notify.showError(error);
        });
    }

    getTemplateCertificate(id, callback){
        ProjectService.getTemplateCertificate(id).then(response => {
            response.data.senderLocations.map(senderLocation => {
                senderLocation._key = uuid.v4();
            });
            callback(response.data);
        }).catch(error=>{
            Notify.showError(error);
        });
    }
    
    getTemplateGoods(id, callback){
        ProjectService.getTemplateGoods(id).then(response => {
            response.data.senderLocations.map(senderLocation => {
                senderLocation._key = uuid.v4();
            });
            callback(response.data);
        }).catch(error=>{
            Notify.showError(error);
        });
    }


    handleCreateNewTemplate(sender){
        let propertyName = {
            'Package': 'templatePackage',
            'ADR': 'templateAdrDetail',
            'Frigo': 'templateFrigo',
            'Certificate': 'templateCertificate',
            'Goods': 'templateGoods'
        }[this.state.templateType];

        this.setState({template:{[propertyName]: this.initialTemplate(sender)} });

    }

    initialTemplate(sender){
        return {sender: sender, senderLocations:[]};
    }

    handleSave(stateChanges){
        _.forEach(stateChanges, (value, key) => {
          this.updateState(key, value)
        })
        this.context.router.push(location.pathname);
    }

    handleUpdateTemplate(key, value){
        let template = _.cloneDeep(this.state.template);
        template[key] = value;
        this.setState({template: template});
    }

    handleCancelTemplate(sender){
        this.setState({template: null, sender: sender, isCreate:false });
        this.context.router.push(location.pathname);
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleEditTemplate(data, type){
        this.context.router.push(`${location.pathname}?id=${data.id}&type=${type}`);
    }

    render(){
        if(!this.state.isCreate){
            if(!this.props.location.query.id) {
                return <SenderTemplateList  template = {this.state.template}
                                            readOnly = {this.state.readOnly}
                                            type={this.state.type}
                                            onCreate = {(sender) => this.handleCreateNewTemplate(sender)}
                                            onChange = {(key, value) => this.updateState(key, value)}
                                            onEdit = {(data, type) => this.handleEditTemplate(data, type)}
                                            sender = { this.state.sender}/>
            }else{
                return null
            }
        }
        if(this.state.template) {

            return (
                <SenderTemplateCreate template={this.state.template} packageTypes={this.state.packageTypes}
                                      readOnly = {this.state.readOnly}
                                      onChange={(key, value) => this.handleUpdateTemplate(key, value)}
                                      updateState = {(key, value) => this.updateState(key,value)}
                                      templateType={this.state.templateType}
                                      handleCancelTemplate={(sender) => this.handleCancelTemplate(sender)}
                                      handleSave ={(value) => this.handleSave(value)}/>
            );
        }else{
            return null;
        }
    }

}

SenderTemplateManagement.contextTypes = {
    router: React.PropTypes.object.isRequired
};