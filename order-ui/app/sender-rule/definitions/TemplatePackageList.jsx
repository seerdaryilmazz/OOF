import React from 'react';
import {TranslatingComponent} from 'susam-components/abstract'
import * as DataTable from 'susam-components/datatable';
import {Grid, GridCell} from 'susam-components/layout'
import {Button} from 'susam-components/basic'
import {SenderLocationPrinter, PackageDetailPrinter} from "../helper/Helper";


export class TemplatePackageList extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {};
    }

    handleCreateNewTemplatePackage(){
        this.props.onChange("isCreate", true);
        this.props.onChange("templateType", "Package");
        this.props.onCreate();
    }

    render(){
        let content = <div>{super.translate("There are no package definitions for this sender")}</div>;
        if(!this.props.sender){
            return null;
        }

        if(this.props.templates && this.props.templates.templatePackage && this.props.templates.templatePackage.length > 0){
            content =
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <DataTable.Table data={this.props.templates.templatePackage} filterable={false} sortable={false}
                                         insertable={false} editable={false}>
                            <DataTable.Text field="senderLocations"
                                            header="Loading Company & Location" sortable={true} filterable={true}
                                            printer={new SenderLocationPrinter(this.context.translator)}/>
                            <DataTable.Text field="packageDetails" header="Package Details"
                                            sortable={true} filterable={true}
                                            printer={new PackageDetailPrinter(this.context.translator)}/>

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
                    <h2 style = {{display: "inline", marginRight: "16px"}}>{super.translate("Package Details")}</h2>
                    <Button label="New Package" flat = {true} size="small" style="success"
                            onclick = {() => this.handleCreateNewTemplatePackage()} />
                </div>
                {content}
            </div>
        );
    }
}

TemplatePackageList.contextTypes = {
    translator: React.PropTypes.object
};