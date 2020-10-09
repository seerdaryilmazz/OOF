import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, CardSubHeader} from 'susam-components/layout'
import {OrderTemplateNodeInfo} from './OrderTemplateNodeInfo';
import {Button, TextInput, DropDown} from 'susam-components/basic';
import {PageHeader, Tab} from 'susam-components/layout';
import {GraphTemplate} from './GraphTemplate';
import {OrderTemplateParentSelection} from './OrderTemplateParentSelection';


export class OrderTemplateNodePage extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            rightpanelcontentselection:"graph",
            nodeData: {},
            typeDefinitions: {
                CUSTOMER: {type: "Customer", genre: "Customer", label: "Customer"},
                ADR: {type: "ADR", genre: "ADR", label: "ADR"},
                CERTIFICATE: {type: "Certificate", genre: "Certificate", label: "Certificate"},
                LOADTYPE: {type: "LoadType", genre: "LoadType", label: "Load Type"},
                PACKAGETYPE: {type: "PackageType", genre: "PackageType", label: "Container"},
                SERVICETYPE: {type: "ServiceType", genre: "ServiceType", label: "Service Type"},
                FROMCOUNTRY: {type: "FromCountry", genre: "Country", label: "Country (From)"},
                TOCOUNTRY: {type: "ToCountry", genre: "Country", label:"Country (To)"},
                SENDERCOMPANY: {type: "SenderCompany", genre: "Company", label: "Company (Sender)"},
                RECEIVERCOMPANY: {type: "ReceiverCompany", genre: "Company", label: "Company (Receiver)"},
                LOADCOMPANY: {type: "LoadCompany", genre: "Company", label: "Company (Load)"},
                UNLOADCOMPANY: {type: "UnloadCompany", genre: "Company", label: "Company (Unload)"},
                LOADADDRESS: {type: "LoadAddress", genre: "Address", label: "Address (Sender)"},
                UNLOADADDRESS: {type: "UnloadAddress", genre: "Address", label: "Address (Receiver)"}

            },
            width:449,
            height:566
        };
    }

    handleTemplateDataChange(field, value) {
        this.state.nodeData[field] = value;

        let nodeData = _.cloneDeep(this.state.nodeData);
        nodeData[field] = value;
        this.setState({nodeData:nodeData});

    }

    handleNodeDataChange(field, value) {

        this.state.nodeData[field] = value;
        this.updateGraphData();
    }

    updateGraphData() {

        let data = this.convertToGraphStructure(this.state.nodeData);


        let nodeCodesStrParam = "";
        if (data.relations && data.relations.length > 0) {

            data.relations.forEach(r => {
                if (nodeCodesStrParam != "") {
                    nodeCodesStrParam += "*";
                }
                nodeCodesStrParam += r.code + "." + r.type;
            })

            nodeCodesStrParam = "nodeCodesStr=" + nodeCodesStrParam;
        }

        axios.get('/order-template-service/template-node/graphdata?' + nodeCodesStrParam).then((result) =>  {
            this.setState({graphData: result.data});
        });
    }


    convertToGraphStructure(orderTemplateNodeJson) {

        let data = _.cloneDeep(orderTemplateNodeJson);
        let result = {}
        result.name = data.name;
        result.description = data.description;

        if(data.parentOrderTemplate) {
            result.parentOrderTemplate = data.parentOrderTemplate;
        }

        result.code = uuid.v4();
        result.relations = [];
        for (var c in data) {
            if (!data.hasOwnProperty(c)) {
                continue;
            }
            else if (c == "name" || c == "parentOrderTemplate" || c == "description") {
                //do nothing
            }
            else {
                let relationNode = this.createRelationNode(data, c);
                //check whether filter is removed or not.
                if(relationNode != null) {
                    result.relations.push(relationNode)
                }

            }

        }

        return result;
    }

    createRelationNode(data, field) {

        let relationNode = null;

        if(data[field] && data[field]!=="") {
            relationNode = {};
            relationNode.code = data[field].code;
            relationNode.name = data[field].name;
            relationNode.type = this.state.typeDefinitions[field].type;
            relationNode.genre = this.state.typeDefinitions[field].genre;
            relationNode.label = this.state.typeDefinitions[field].label;
        }

        return relationNode;
    }

    componentDidMount() {

        let state = _.cloneDeep(this.state);

        state.height=$('#graphContainer').height();
        state.width = $('#graphContainer').width();
        this.setState(state);

    }
    saveTemplateNodeByUsingParent(parent){

        this.state.nodeData.parentOrderTemplate = parent;
        this.saveTemplateNode();
    }
c
    openEditTemplateWindow(orderTemplate) {
        window.open("/ui/order/order-template?code=" + orderTemplate.code + "&type=OrderTemplate");
    }

    saveTemplateNode() {

        let dataToBePost = this.convertToGraphStructure(this.state.nodeData);

        if(!this.validateSelections(dataToBePost)) {
            return;
        }

        axios.post("/order-template-service/template-node", dataToBePost)
            .then(function (res) {
                window.location = "/ui/order/order-template?code=" + dataToBePost.code + "&type=OrderTemplate";
            })
            .catch(function (err) {
                UIkit.notify("An Error Occured");
                console.log("Error:" + err);
            });

    }

    validateSelections(data) {
        console.log(JSON.stringify(data.relations));
        console.log(JSON.stringify(data.relations.map((f) => {return f.type})));

        let self = this;
        if(!data.relations || data.relations.length < 2) {
            UIkit.notify("At least 2 attriutes must be selected.");
            return false;
        } else if(!data.relations.map(f => {return f.type;}).includes(self.state.typeDefinitions.CUSTOMER.type)) {
            UIkit.notify("A Customer must be selected.");
            return false;
        } else {
            return true;
        }
    }

    openTemplatePageInNewWindow(fieldName) {


        let relationNode = this.createRelationNode(this.state.nodeData, fieldName);

        if (!relationNode) return;

        axios.post("/order-template-service/template-node/param", relationNode)
            .then(function (res) {
                window.open("/ui/order/order-template?code=" + relationNode.code
                    + "&type=" + relationNode.type);
            })
            .catch(function (err) {
                UIkit.notify("An Error Occured while initializing edit operation for " + relationNode.name);
                console.log("Error:" + err);
            });

    }

    retrieveRightPanel() {

        let result = [];

        if (this.state.graphData) {

            if (this.state.graphData.nodes && this.state.graphData.nodes.length > 0) {
                result.push(<GraphTemplate data={this.state.graphData} width={this.state.width}
                                           height={this.state.height}></GraphTemplate>);
            }
            if (this.state.graphData.parentTemplateOptions && this.state.graphData.parentTemplateOptions.length > 0) {
                result.push(<OrderTemplateParentSelection
                    useParentCreateTemplateHandler={(parentTemplate) => this.saveTemplateNodeByUsingParent(parentTemplate)}
                    templateEditHandler={(orderTemplate) => this.openEditTemplateWindow(orderTemplate)}
                    data={this.state.graphData.parentTemplateOptions}></OrderTemplateParentSelection>);
            }
        }

        if (result.length == 0) {
            return null;
        }
        else if (result.length == 1) {
            return result[0];
        }
        else {
            let button;
            let content;
            if (this.state.rightpanelcontentselection == 'graph') {
                    button = <Button label="Show Projects" style="primary" waves={true}
                                     onclick={() => {this.setState({rightpanelcontentselection:"project"})}}/>;
                content = result[0];

            } else {
                    button = <Button label="Show Graph" style="primary" waves={true}
                                     onclick={() => {this.setState({rightpanelcontentselection:"graph"})}}/>;
                content = result[1];
            }

            return (
                <Grid noMargin={true}>
                    <GridCell width="1-1">{button}</GridCell>
                    <GridCell width="1-1">{content}</GridCell>
                </Grid>
            );

        }
    }

    render() {
        return (
            <div>
                <PageHeader title="New Order Template"/>
                <Grid>

                    <GridCell width="1-1">
                        <Card>
                            <Grid>
                                <GridCell width="1-3">
                                    <TextInput label="Template Name" value={this.state.nodeData.name}
                                               onchange={(value) => this.handleTemplateDataChange("name", value)}/>
                                </GridCell>
                                <GridCell width="2-3">
                                    <TextInput label="Template Description" value={this.state.nodeData.description}
                                               onchange={(value) => this.handleTemplateDataChange("description", value)}/>
                                </GridCell>

                            </Grid>
                        </Card>
                    </GridCell>


                    <GridCell width="1-1">
                        <Card title="Order Node Information">
                            <Grid divider="true" >
                                <GridCell width="1-2">
                                    <OrderTemplateNodeInfo
                                        dataChangeHandler={(field, value) => this.handleNodeDataChange(field, value)}
                                        handleRedirectForParamTemplate = {(field) => this.openTemplatePageInNewWindow(field)}/>
                                </GridCell>
                                <GridCell width="1-2" id="graphContainer">
                                    {this.retrieveRightPanel()}

                                </GridCell>

                                <GridCell width="4-4">
                                    <div className="uk-float-right">
                                        <Button label="Next" style="primary" waves={true}
                                                onclick={() => this.saveTemplateNode()}/>
                                    </div>
                                </GridCell>

                            </Grid>
                        </Card>
                    </GridCell>

                </Grid>

            </div>
        );
    }
}

OrderTemplateNodePage.contextTypes = {
    translator: React.PropTypes.object
};