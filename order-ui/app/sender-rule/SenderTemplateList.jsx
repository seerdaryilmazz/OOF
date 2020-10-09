import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import { OrderService, ProjectService } from '../services';
import { TemplateAdrList } from "./definitions/TemplateAdrList";
import { TemplateCertificateList } from "./definitions/TemplateCertificateList";
import { TemplateFrigoList } from "./definitions/TemplateFrigoList";
import { TemplateGoodsList } from './definitions/TemplateGoodsList';
import { TemplatePackageList } from "./definitions/TemplatePackageList";

export class SenderTemplateList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {adrClassDetails:{}};
        if(this.props.sender){
            this.handleSelectSender(this.props.sender);
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.sender) {
            this.handleSelectSender(nextProps.sender);
        }
    }


    handleSelectSender(sender){
        ProjectService.getTemplatesForSender(sender.id).then(response => {
            response.data.templatePackage.map(template =>{
                if(template.packageDetails) {
                    template.packageDetails.map(packageDetail => {
                        packageDetail._key = uuid.v4();
                    });
                }
                if(template.senderLocations) {
                    template.senderLocations.map(senderLocation => {
                        senderLocation._key = uuid.v4();
                    });
                }
            })

            response.data.templateFrigo.map(template=>{
                if(template.senderLocations) {
                    template.senderLocations.map(senderLocation => {
                        senderLocation._key = uuid.v4();
                    });
                }
            })

            response.data.templateCertificate.map(template=>{
                if(template.senderLocations) {
                    template.senderLocations.map(senderLocation => {
                        senderLocation._key = uuid.v4();
                    });
                }
            })

            if(response.data.templateAdrDetail) {

                let unIdsToList = [];
                response.data.templateAdrDetail.map(templateAdrDetail => {
                    if (templateAdrDetail.senderLocations) {
                        templateAdrDetail.senderLocations.map(senderLocation => {
                            senderLocation._key = uuid.v4();
                        });
                    }
                    templateAdrDetail.adrClassDetails = []
                    if (templateAdrDetail.unIds){
                        unIdsToList.push(templateAdrDetail.unIds);
                    }else{
                        templateAdrDetail.unIds = [];
                    }
                });


                let uniqueList = _.uniq(unIdsToList);

                if(uniqueList.length > 0){
                    this.getAdrClassDetails(uniqueList, (templateAdrClassDetails) => {
                        response.data.templateAdrDetail.map(templateAdrDetail => {
                            _.forEach(templateAdrDetail.unIds, (value) => {
                                let adrClassDetail = _.filter(templateAdrClassDetails, adrClassDetail => {
                                    return adrClassDetail.id == value;
                                });
                                templateAdrDetail.adrClassDetails =[...templateAdrDetail.adrClassDetails, ...adrClassDetail];
                            });
                        })
                        this.setState({templates: response.data, sender: sender});
                    });
                }else{
                    this.setState({templates: response.data, sender: sender});
                }
            }

        }).catch(error => {
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
    handleDeleteTemplatePackage(data){
        Notify.confirm("Are you sure?", () => {

            ProjectService.deleteTemplatePackage(data.id).then(response => {
                Notify.showSuccess("Package definition deleted");
                let templates = _.cloneDeep(this.state.templates);
                _.remove(templates.templatePackage, (elem) => {
                    return elem.id == data.id;
                });
                this.setState({templates: templates});
            }).catch(error => {
                Notify.showError(error);
            });

        });

    }
    
    handleDeleteTemplateGoods(data){
        Notify.confirm("Are you sure?", () => {

            ProjectService.deleteTemplateGoods(data.id).then(response => {
                Notify.showSuccess("Package definition deleted");
                let templates = _.cloneDeep(this.state.templates);
                _.remove(templates.templateGoods, (elem) => {
                    return elem.id == data.id;
                });
                this.setState({templates: templates});
            }).catch(error => {
                Notify.showError(error);
            });

        });

    }

    handleDeleteTemplateAdrDetail(data){
        Notify.confirm("Are you sure?", () => {
            ProjectService.deleteTemplateAdrDetail(data.id).then(response => {
                Notify.showSuccess("Dangerous Goods definition deleted");
                let templates = _.cloneDeep(this.state.templates);
                _.remove(templates.templateAdrDetail, (elem) => {
                    return elem.id == data.id;
                });
                this.setState({templates: templates});
            }).catch(error => {
                Notify.showError(error);
            });

        });
    }

    handleDeleteTemplateFrigo(data){
        Notify.confirm("Are you sure?", () => {
            ProjectService.deleteTemplateFrigo(data.id).then(response => {
                Notify.showSuccess("Temperature Controlled Goods definition deleted");
                let templates = _.cloneDeep(this.state.templates);
                _.remove(templates.templateFrigo, (elem) => {
                    return elem.id == data.id;
                });
                this.setState({templates: templates});
            }).catch(error => {
                Notify.showError(error);
            });

        });
    }

    handleDeleteTemplateCertificate(data){
        Notify.confirm("Are you sure?", () => {
            ProjectService.deleteTemplateCertificate(data.id).then(response => {
                Notify.showSuccess("Certificated Goods definition deleted");
                let templates = _.cloneDeep(this.state.templates);
                _.remove(templates.templateCertificate, (elem) => {
                    return elem.id == data.id;
                });
                this.setState({templates: templates});
            }).catch(error => {
                Notify.showError(error);
            });

        });
    }

    

    render(){

        return(
            <div>
                <PageHeader title="Sender Templates" translate={true}/>
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-3">
                                    <CompanySearchAutoComplete  label = "Sender" value = {this.state.sender}
                                                                readOnly = {this.props.readOnly}
                                                                onchange = {(value) => this.handleSelectSender(value)} />
                                </GridCell>

                                {!this.props.type || this.props.type === "Goods"
                                    ?<GridCell width="1-1">
                                        <TemplateGoodsList templates={this.state.templates} sender = {this.state.sender}
                                                         onChange = {(key, value) => this.props.onChange(key, value)}
                                                         onCreate = {() => this.props.onCreate(this.state.sender)}
                                                         onDelete = {(data) => this.handleDeleteTemplateGoods(data)}
                                                         onEdit = {(data)=>this.props.onEdit(data,"Goods")}
                                                         />
                                    </GridCell>:null}

                                 {!this.props.type || this.props.type === "Package"
                                    ?<GridCell width="1-1">
                                            <TemplatePackageList templates={this.state.templates} sender = {this.state.sender}
                                                         onChange = {(key, value) => this.props.onChange(key, value)}
                                                         onCreate = {() => this.props.onCreate(this.state.sender)}
                                                         onDelete = {(data) => this.handleDeleteTemplatePackage(data)}
                                                         onEdit = {(data)=>this.props.onEdit(data,"Package")}
                                                         />
                                    </GridCell>:null}

                                {!this.props.type || this.props.type === "ADR"
                                    ?<GridCell width="1-1">
                                        <TemplateAdrList templates={this.state.templates} sender = {this.state.sender}
                                                     adrClassDetails = {this.state.adrClassDetails}
                                                     onChange = {(key, value) => this.props.onChange(key, value)}
                                                     onCreate = {() => this.props.onCreate(this.state.sender)}
                                                     onDelete = {(data) => this.handleDeleteTemplateAdrDetail(data)}
                                                     onEdit = {(data)=>this.props.onEdit(data,"ADR")}/>
                                    </GridCell>:null}

                                {!this.props.type || this.props.type === "Certificate"
                                    ?<GridCell width="1-1">
                                        <TemplateCertificateList templates={this.state.templates} sender = {this.state.sender}
                                                       onChange = {(key, value) => this.props.onChange(key, value)}
                                                       onCreate = {() => this.props.onCreate(this.state.sender)}
                                                       onDelete = {(data) => this.handleDeleteTemplateCertificate(data)}
                                                       onEdit = {(data)=>this.props.onEdit(data,"Certificate")}/>
                                    </GridCell>:null}

                                {!this.props.type || this.props.type === "Frigo"
                                    ?<GridCell width="1-1">
                                        <TemplateFrigoList templates={this.state.templates} sender = {this.state.sender}
                                                     onChange = {(key, value) => this.props.onChange(key, value)}
                                                     onCreate = {() => this.props.onCreate(this.state.sender)}
                                                     onDelete = {(data) => this.handleDeleteTemplateFrigo(data)}
                                                     onEdit = {(data)=>this.props.onEdit(data,"Frigo")}/>
                                    </GridCell>:null}
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}

SenderTemplateList.contextTypes = {
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
};