import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify, TextArea } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { RichTextEditor, ServiceAreaDropDown, SubsidiaryDropDown, SupportedLocaleDropDown } from "../common";

const MAX_HTML_TEXT_LENGTH = 50000;

export class SpotQuotePdfSetting extends TranslatingComponent {

    constructor(props) {
        super(props);
        let data = _.cloneDeep(props.data);
        this.state = {
            subsidiary: data.subsidiary,
            serviceArea: data.serviceArea,
            language: data.language,
            aboutCompany: data.aboutCompany,
            importGeneralConditions: data.importGeneralConditions,
            exportGeneralConditions: data.exportGeneralConditions
        };
    }

    componentDidMount() {
    }

    updateProperty(propertyName, propertyValue) {
        this.setState({[propertyName]: propertyValue});
    }

    cancel() {
        this.props.onCancel();
    }

    save() {

        let state = _.cloneDeep(this.state);

        if (_.isNil(state.subsidiary)) {
            Notify.showError("A subsidiary must be specified.");
            return;
        }

        if (_.isNil(state.serviceArea)) {
            Notify.showError("A service area must be specified.");
            return;
        }

        if (_.isNil(state.language)) {
            Notify.showError("A language must be specified.");
            return;
        }

        if (!_.isNil(state.aboutCompany) && state.aboutCompany.length > MAX_HTML_TEXT_LENGTH) {
            Notify.showError("About company text can have maximum " + MAX_HTML_TEXT_LENGTH + " characters.");
            return;
        }

        if (!_.isNil(state.importGeneralConditions) && state.importGeneralConditions.length > MAX_HTML_TEXT_LENGTH) {
            Notify.showError("Import general conditions text can have maximum " + MAX_HTML_TEXT_LENGTH + " characters.");
            return;
        }

        if (!_.isNil(state.exportGeneralConditions) && state.exportGeneralConditions.length > MAX_HTML_TEXT_LENGTH) {
            Notify.showError("Export general conditions text can have maximum " + MAX_HTML_TEXT_LENGTH + " characters.");
            return;
        }

        let data = _.cloneDeep(this.props.data);
        data.subsidiary = state.subsidiary;
        data.serviceArea = state.serviceArea;
        data.language = state.language;
        data.aboutCompany = state.aboutCompany;
        data.importGeneralConditions = state.importGeneralConditions;
        data.exportGeneralConditions = state.exportGeneralConditions;

        this.props.onSave(data);
    }

    getTitle() {

        let title;

        if (this.props.readOnly) {
            title = "Spot Quote Pdf Setting";
        } else {
            let inEditMode = !_.isNil(this.props.data.id);
            if (inEditMode) {
                title = "Edit Spot Quote Pdf Setting";
            } else {
                title = "New Spot Quote Pdf Setting";
            }
        }

        return title;
    }

    renderSaveButton() {
        if (this.props.readOnly) {
            return null;
        } else {
            return (
                <Button label="Save" style="primary" waves={true} onclick={() => this.save()}/>
            );
        }
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <PageHeader title={this.getTitle()}/>
                </GridCell>
                <GridCell width="1-1">
                    <Card>
                        <Grid>
                            <GridCell width="1-1">
                                <SubsidiaryDropDown label="Subsidiary"
                                                    value={this.state.subsidiary}
                                                    onchange={(value) => this.updateProperty("subsidiary", value)}
                                                    required={true}
                                                    readOnly={this.props.readOnly}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <ServiceAreaDropDown label="Service Area"
                                                     value={this.state.serviceArea}
                                                     labelField="name"
                                                     valueField="code"
                                                     onchange={(value) => this.updateProperty("serviceArea", value)}
                                                     required={true}
                                                     readOnly={this.props.readOnly}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <SupportedLocaleDropDown label="Language"
                                                         value={this.state.language}
                                                         onchange={(value) => this.updateProperty("language", value)}
                                                         required={true}
                                                         readOnly={this.props.readOnly}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <TextArea label="About Company"
                                          value={this.state.aboutCompany}
                                          onchange={(value) => this.updateProperty("aboutCompany", value)}
                                          readOnly={this.props.readOnly}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <RichTextEditor label="Import General Conditions"
                                                value={this.state.importGeneralConditions}
                                                asHtml={true}
                                                onChange={(value) => this.updateProperty("importGeneralConditions", value)}
                                                minHeight="200px"
                                                readOnly={this.props.readOnly}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <RichTextEditor label="Export General Conditions"
                                                value={this.state.exportGeneralConditions}
                                                asHtml={true}
                                                onChange={(value) => this.updateProperty("exportGeneralConditions", value)}
                                                minHeight="200px"
                                                readOnly={this.props.readOnly}/>
                            </GridCell>
                        </Grid>
                    </Card>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Cancel" waves={true} onclick={() => this.cancel()}/>
                        {this.renderSaveButton()}
                    </div>
                </GridCell>
            </Grid>
        );
    }
}

