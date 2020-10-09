import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { HSCodeExtendedAutoComplete } from "../../common/HSCodeExtendedAutoComplete";
import { SenderTemplateSenderLocations } from "../SenderTemplateSenderLocations";

export class TemplateGoodsCreate extends TranslatingComponent {

    constructor(props) {
        super(props);
        if(this.props.templateGoods.goods){
            this.state={selectedHSCodes:[...this.props.templateGoods.goods]}
        } else{
            this.state={selectedHSCodes:[]}
        }
    }

    handleDeleteClick(goods) {
        Notify.confirm("Are you sure?", () => {
            let selectedHSCodes = _.cloneDeep(this.state.selectedHSCodes);
            _.remove(selectedHSCodes, item => item.name === goods.name);
            this.setState({ selectedHSCodes: selectedHSCodes });
            this.props.onChange("goods", this.state.selectedHSCodes.map(h => { return { code: h.code, name: h.name } }));
        });
    }

    handleAddClick() {
        if(!this.state.goods){
            Notify.showError("Please select Definition of Goods")
        }else if(_.includes(this.state.selectedHSCodes.map(i=>i.name), this.state.goods.name)){
            Notify.showError("Same Definition of Goods exists")
        }else{
            let selectedHSCodes = _.cloneDeep(this.state.selectedHSCodes);
            selectedHSCodes.push(this.state.goods);

            this.setState({goods: {}, selectedHSCodes: selectedHSCodes});
            this.props.onChange("goods", this.state.selectedHSCodes.map(h=>{return {id: h.id, code: h.code, name: h.name}}));
        }

    }

    onHSCodeChange(value) {
        this.setState({ goods: value });
    }

    renderHSCodeDetail() {
        let list = <div>{super.translate("There is no Definition of Goods")}</div>;
        if (this.state.selectedHSCodes && this.state.selectedHSCodes.length > 0) {
            list = <ul className="md-list">
                {this.state.selectedHSCodes.map(item => {
                    return (
                        <li key={item.id}>
                            <Grid>
                                <GridCell width="1-8" noMargin={true}>
                                    HS: {item.code}
                                </GridCell>
                                <GridCell width="3-4" noMargin={true}>
                                    {item.name}
                                </GridCell>
                                <GridCell width="1-8" noMargin={true}>
                                    <div className="uk-align-right">
                                        <Button label = "delete" flat = {true} size = "small" style = "danger" onclick={()=>this.handleDeleteClick(item)} />
                                    </div>
                                </GridCell>
                            </Grid>
                        </li>
                    );
                })}
            </ul>;
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-3">
                        <HSCodeExtendedAutoComplete label = "Definition of Goods" value={this.state.goods} onChange={(value) => this.onHSCodeChange(value)}></HSCodeExtendedAutoComplete>
                        </GridCell>
                        <GridCell width="1-10">
                            <div className="uk-margin-top">
                                <Button label="add" size="small" style="success" waves={true} onclick={() => this.handleAddClick()} />
                            </div>
                        </GridCell>
                    </Grid>
                </GridCell>

                <GridCell width="1-1">
                    {list}
                </GridCell>
            </Grid>
        );
    }

    renderNewTemplateGoods() {
        if (!this.props.templateGoods) {
            return null;
        }
        return (
            <Grid>
                <GridCell width="1-3">
                    <CompanySearchAutoComplete label="Sender" value={this.props.templateGoods.sender} required={true}
                        readOnly = {this.props.readOnly} onchange={(value) => this.props.onChange("sender", value)} />
                </GridCell>
                <GridCell >
                    <SenderTemplateSenderLocations template={this.props.templateGoods}
                        onChange={(value) => this.props.onChange("senderLocations", value)} />
                </GridCell>
                <GridCell >
                    {this.renderHSCodeDetail()}
                </GridCell>

                <GridCell width="1-1">
                    <div className="uk-align-left">
                        <Button label="cancel" size="small"
                            onclick={() => this.props.handleCancelTemplate()} />
                    </div>
                    <div className="uk-align-right">
                        <Button label="save template" style="primary" size="small"
                            onclick={() => this.props.handleSaveTemplate()} />
                    </div>
                </GridCell>

            </Grid>
        );
    }

    render() {
        let senderName = this.props.templateGoods.sender ? this.props.templateGoods.sender.name : "";
        return (
            <div>
                <PageHeader title={`${super.translate("Sender Template")}: ${senderName}`} />
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            {this.renderNewTemplateGoods()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}

TemplateGoodsCreate.contextTypes = {
    translator: PropTypes.object
};