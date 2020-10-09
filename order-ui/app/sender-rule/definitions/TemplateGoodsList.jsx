import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell } from 'susam-components/layout';
import { GoodsPrinter, SenderLocationPrinter } from "../helper/Helper";

export class TemplateGoodsList extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {};
    }

    handleCreateNewTemplateGoods(){
        this.props.onChange("isCreate", true);
        this.props.onChange("templateType", "Goods");
        this.props.onCreate();
    }

    render(){
        let content = <div>{super.translate("There are no definiton of goods for this sender")}</div>;
        if(!this.props.sender){
            return null;
        }

        if(this.props.templates && this.props.templates.templateGoods && this.props.templates.templateGoods.length > 0){
            content =
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <DataTable.Table data={this.props.templates.templateGoods} filterable={false} sortable={false}
                                         insertable={false} editable={false}>
                            <DataTable.Text width="38"
                                            field="senderLocations"
                                            header="Loading Company & Location" sortable={true} filterable={true}
                                            printer={new SenderLocationPrinter(this.context.translator)}/>
                            <DataTable.Text field="goods" header="Goods"
                                            sortable={true} filterable={true}
                                            printer={new GoodsPrinter(this.context.translator)}/>

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
                    <h2 style = {{display: "inline", marginRight: "16px"}}>{super.translate("Definition of Goods")}</h2>
                    <Button label="New Definition" flat = {true} size="small" style="success"
                            onclick = {() => this.handleCreateNewTemplateGoods()} />
                </div>
                {content}
            </div>
        );
    }
}

TemplateGoodsList.contextTypes = {
    translator: React.PropTypes.object
};