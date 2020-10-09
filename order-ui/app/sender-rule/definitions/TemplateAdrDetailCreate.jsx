import _ from "lodash";
import React from "react";
import PropTypes from 'prop-types';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify, RadioButton, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { OrderService } from "../../services";
import { SenderTemplateSenderLocations } from "../SenderTemplateSenderLocations";
import { AdrItem } from "./AdrItem";

export class TemplateAdrDetailCreate extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {selectedADRs:[]};
        if(this.props.selectedADRs){
            this.state={selectedADRs:[...this.props.selectedADRs]}
        }
        if(this.props.templateAdrDetail && !this.props.templateAdrDetail.shouldBeAsked) {
            this.props.onChange("shouldBeAsked", false);
        }
    }

    updateAdrUnNumber(value){
        if(value.length === 4){
            this.handleSearchAdrType(value);
        }
        this.updateState("adrUnNumber", value);
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleSearchAdrType(unNumber){
        OrderService.searchAdrClassDetails(unNumber)
            .then(response => this.setState({adrSearchResults: response.data}, () => this.updateState("adrDetail", null)))
            .catch(error => Notify.showError(error));
    }

    renderAdrSearchResult(item){
        let selected = _.get(this.state, "adrDetail.id") === item.id;
        let listItemClassName = selected ? "md-bg-blue-50" : "";
        return(
            <li key = {item.id} className = {listItemClassName}
                onClick = {() => this.updateState("adrDetail", item)} style = {{cursor: "pointer"}}>
                <AdrItem item = {item}/>
            </li>
        );
    }

    handleAddClick(){
        if(!this.state.adrDetail){
            Notify.showError("Please select ADR UN Number")
        }else if(_.includes(this.props.templateAdrDetail.unIds, this.state.adrDetail.id)){
            Notify.showError("Same ADR UN Number exists")
        }else{
            let template = _.cloneDeep(this.props.templateAdrDetail);
            if (!template.unIds) {
                template.unIds = [];
            }
            template.unIds.push(this.state.adrDetail.id);

            let selectedADRs = _.cloneDeep(this.state.selectedADRs);
            selectedADRs.push(this.state.adrDetail);

            this.setState({adrDetail: {}, adrSearchResults: null, selectedADRs: selectedADRs});
            this.props.onChange("unIds", template.unIds);
        }

    }

    handleDeleteClick(adrItem){
        Notify.confirm("Are you sure?", () => {
            let selectedADRs = _.cloneDeep(this.state.selectedADRs);
            let template = _.cloneDeep(this.props.templateAdrDetail);
            _.remove(template.unIds, unId => unId === adrItem.id);
            _.remove(selectedADRs, item => item.id === adrItem.id);
            this.setState({selectedADRs:selectedADRs});
            this.props.onChange("unIds", template.unIds);
        });
    }

    updateShouldBeAsked(value, valueToSet){
        this.props.onChange("shouldBeAsked", valueToSet)
        if(!valueToSet){
            this.setState({adrDetail: {}, adrSearchResults: null, selectedADRs:[], adrUnNumber:null});
            this.props.onChange("unIds", []);
        }
    }

    renderAdrUnDetail(){
        if(!this.props.templateAdrDetail.shouldBeAsked){
            return null;
        }

        let adrSearchResults = null;
        if(this.state.adrSearchResults){
            adrSearchResults = this.state.adrSearchResults.map(item => this.renderAdrSearchResult(item));
        }

        let list = <div>{super.translate("There is no selected ADR UN Number")}</div>;
        if(this.state.selectedADRs && this.state.selectedADRs.length > 0 ) {
            list = <ul className = "md-list">
                {this.state.selectedADRs.map(item => {
                    return(
                        <li key = {item.id}>
                            <AdrItem item = {item}
                                     onDelete = {(item)=>this.handleDeleteClick(item)}/>
                        </li>
                    );
                })}
            </ul>;
        }

        return(
            <Grid>
                <GridCell width = "1-1">
                    <Grid>
                        <GridCell width = "1-3">
                            <TextInput id = "adrUnNumber" label = "ADR UN Number" value = {this.state.adrUnNumber}
                                       onchange = {(value) => this.updateAdrUnNumber(value)} />
                        </GridCell>
                        <GridCell width="1-10">
                            <div className = "uk-margin-top">
                                <Button label="add" size="small" style="success" waves = {true} onclick = {() => this.handleAddClick()}/>
                            </div>
                        </GridCell>
                        <GridCell width = "1-1">
                            <ul className="md-list">{adrSearchResults}</ul>
                        </GridCell>
                    </Grid>
                </GridCell>

                <GridCell width="1-1">
                    {list}
                </GridCell>
            </Grid>
        );
    }

    renderNewTemplateAdrDetail(){
        if(!this.props.templateAdrDetail){
            return null;
        }

        return (
            <Grid>
                <GridCell width = "1-3">
                    <CompanySearchAutoComplete label = "Sender" value = {this.props.templateAdrDetail.sender} required = {true}
                                                readOnly = {this.props.readOnly} onchange = {(value) => this.props.onChange("sender", value)} />
                </GridCell>
                <GridCell width = "1-1">
                    <SenderTemplateSenderLocations template = {this.props.templateAdrDetail}
                                                   onChange = {(value) => this.props.onChange("senderLocations", value)}/>
                </GridCell>
                <GridCell width="1-6">
                    <span className="uk-text-large uk-text-bold uk-text-primary">
                        {super.translate("Dangerous Goods")}
                    </span>
                </GridCell>
                <GridCell width="1-1">
                    <RadioButton label="Should Be Asked" inline={true}
                                 name="shouldBeAsked"
                                 checked={this.props.templateAdrDetail.shouldBeAsked == true}
                                 onchange={(value) => this.updateShouldBeAsked(value, true)} />
                    <RadioButton label="Packages Do NOT Contain" inline={true}
                                 name="shouldBeAsked"
                                 checked={this.props.templateAdrDetail.shouldBeAsked == false}
                                 onchange={(value) => this.updateShouldBeAsked(value, false)} />
                </GridCell>

                <GridCell width="1-1">
                    {this.renderAdrUnDetail()}
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
        let senderName = this.props.templateAdrDetail.sender ? this.props.templateAdrDetail.sender.name : "";
        return(
            <div>
                <PageHeader title={`${super.translate("Sender Template")}: ${senderName}`} />
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            {this.renderNewTemplateAdrDetail()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}

TemplateAdrDetailCreate.contextTypes = {
    translator: PropTypes.object
};