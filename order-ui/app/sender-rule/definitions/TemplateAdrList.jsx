import React from 'react'
import {TranslatingComponent} from 'susam-components/abstract'
import * as DataTable from 'susam-components/datatable';
import {Grid, GridCell} from 'susam-components/layout'
import {Button} from 'susam-components/basic'
import {
    SenderLocationPrinter,
    GoodsDecisionPrinter,
    DangerousGoodsDetailPrinter
} from "../helper/Helper";

export class TemplateAdrList extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    handleCreateNewAdrList(){
        this.props.onChange("isCreate", true);
        this.props.onChange("templateType", "ADR");
        this.props.onCreate();
    }


    render(){
        let content = <div>{super.translate("There are no dangerous goods definitions for this sender")}</div>;
        if(!this.props.sender){
            return null;
        }

        if(this.props.templates && this.props.templates.templateAdrDetail && this.props.templates.templateAdrDetail.length > 0){

            content =
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <DataTable.Table data={this.props.templates.templateAdrDetail} filterable={false} sortable={false}
                                         insertable={false} editable={false}>
                            <DataTable.Text field="senderLocations"
                                            header="Loading Company & Location" sortable={false} filterable={false}
                                            printer={new SenderLocationPrinter(this.context.translator)}/>

                            <DataTable.Text field="shouldBeAsked"
                                            header="Dangerous Goods" sortable={false} filterable={false}
                                            printer={new GoodsDecisionPrinter(this.context.translator)}/>

                            <DataTable.Text field="adrClassDetails"
                                            header="Details" sortable={false} filterable={false}
                                            printer={new DangerousGoodsDetailPrinter(this.context.translator)}/>

                            <DataTable.ActionColumn width="10">
                                <DataTable.ActionWrapper track="onclick"
                                                         onaction={(data) => {
                                                             this.props.onEdit(data)
                                                         }}>
                                    <Button label="Edit" flat={true} style="success" size="small"/>
                                </DataTable.ActionWrapper>
                                <DataTable.ActionWrapper track="onclick"
                                                         onaction={(data) => {
                                                             this.props.onDelete(data)
                                                         }}>
                                    <Button label="Delete" flat={true} style="danger" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>

                    </GridCell>
                </Grid>;

        }




        return (
            <div>
                <div>
                    <h2 style = {{display: "inline", marginRight: "16px"}}>{super.translate("Dangerous Goods")}</h2>
                    <Button label="New Definition" flat = {true} size="small" style="success"
                        onclick = {() => this.handleCreateNewAdrList()} />
                </div>
                {content}
            </div>
        );
    }
}

TemplateAdrList.contextTypes = {
    translator: React.PropTypes.object
};