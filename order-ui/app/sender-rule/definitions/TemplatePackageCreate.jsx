import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { SenderTemplatePackageDetails } from "../SenderTemplatePackageDetails";
import { SenderTemplateSenderLocations } from "../SenderTemplateSenderLocations";


export class TemplatePackageCreate extends TranslatingComponent {

    renderNewTemplatePackage(){
        if(!this.props.templatePackage){
            return null;
        }
        return (
            <Grid>
                <GridCell width = "1-3">
                    <CompanySearchAutoComplete  label = "Sender" value = {this.props.templatePackage.sender} required = {true}
                                                readOnly = {this.props.readOnly} onchange = {(value) => this.props.onChange("sender", value)} />
                </GridCell>
                <GridCell >
                    <SenderTemplateSenderLocations template = {this.props.templatePackage}
                                                   onChange = {(value) => this.props.onChange("senderLocations", value)}/>

                    <SenderTemplatePackageDetails packageTypes = {this.props.packageTypes}
                                                  template = {this.props.templatePackage}
                                                  onChange = {(value) => this.props.onChange("packageDetails", value)}/>

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
        let senderName = this.props.templatePackage.sender ? this.props.templatePackage.sender.name : "";
        return(
            <div>
                <PageHeader title={`${super.translate("Sender Template")}: ${senderName}`} />
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            {this.renderNewTemplatePackage()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}

TemplatePackageCreate.contextTypes = {
    translator: PropTypes.object
};