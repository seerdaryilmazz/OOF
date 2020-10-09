import React from 'react'
import {TranslatingComponent} from 'susam-components/abstract'
import * as DataTable from 'susam-components/datatable';
import {Grid, GridCell} from 'susam-components/layout'
import {Button} from 'susam-components/basic'
import {
    SenderLocationPrinter,
    GoodsDecisionPrinter
} from "../helper/Helper";
export class TemplateFrigoList extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {};
    }

    handleCreateNewFrigo(){
        this.props.onChange("isCreate", true);
        this.props.onChange("templateType", "Frigo");
        this.props.onCreate();
    }

    render(){
        let content = <div>{super.translate("There are no temperature controlled goods definitions for this sender")}</div>;
        if(!this.props.sender){
            return null;
        }

        if(this.props.templates && this.props.templates.templateFrigo && this.props.templates.templateFrigo.length > 0){

            content =
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <DataTable.Table data={this.props.templates.templateFrigo} filterable={false} sortable={false}
                                         insertable={false} editable={false}>
                            <DataTable.Text field="senderLocations"
                                            header="Loading Company & Location" sortable={false} filterable={false}
                                            printer={new SenderLocationPrinter(this.context.translator)}/>

                            <DataTable.Text field="shouldBeAsked"
                                            header="Temperature Controlled Goods" sortable={false} filterable={false}
                                            printer={new GoodsDecisionPrinter(this.context.translator)}/>

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
                    <h2 style = {{display: "inline", marginRight: "16px"}}>{super.translate("Temperature Controlled Goods")}</h2>
                    <Button label="New Definition" flat = {true} size="small" style="success"
                            onclick = {() => this.handleCreateNewFrigo()} />
                </div>
                {content}
            </div>
        );
    }

}

TemplateFrigoList.contextTypes = {
    translator: React.PropTypes.object
};