import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, RadioButton } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from "susam-components/layout";
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { SenderTemplateSenderLocations } from "../SenderTemplateSenderLocations";

export class TemplateFrigoCreate extends TranslatingComponent {

    constructor(props){
        super(props);

        if(this.props.templateFrigo && !this.props.templateFrigo.shouldBeAsked) {
            this.props.onChange("shouldBeAsked", false);
        }
    }


    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }



    updateShouldBeAsked(value, valueToSet){
        this.props.onChange("shouldBeAsked", valueToSet)
    }


    renderTemplateFrigo(){
        if(!this.props.templateFrigo){
            return null;
        }

        return (
            <Grid>
                <GridCell width = "1-3">
                    <CompanySearchAutoComplete  label = "Sender" value = {this.props.templateFrigo.sender} required = {true}
                                                readOnly = {this.props.readOnly} onchange = {(value) => this.props.onChange("sender", value)} />
                </GridCell>
                <GridCell width = "1-1">
                    <SenderTemplateSenderLocations template = {this.props.templateFrigo}
                                                   onChange = {(value) => this.props.onChange("senderLocations", value)}/>
                </GridCell>
                <GridCell width = "1-3">
                    <span className="uk-text-large uk-text-bold uk-text-primary">
                        {super.translate("Temperature Controlled Goods")}
                    </span>
                </GridCell>
                <GridCell width="1-1">
                    <RadioButton label="Should Be Asked" inline={true}
                                 name="shouldBeAsked"
                                 checked={this.props.templateFrigo.shouldBeAsked == true}
                                 onchange={(value) => this.updateShouldBeAsked(value, true)} />
                    <RadioButton label="Packages Do NOT Contain" inline={true}
                                 name="shouldBeAsked"
                                 checked={this.props.templateFrigo.shouldBeAsked == false}
                                 onchange={(value) => this.updateShouldBeAsked(value, false)} />
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
        let senderName = this.props.templateFrigo.sender ? this.props.templateFrigo.sender.name : "";
        return(
            <div>
                <PageHeader title={`${super.translate("Sender Template")}: ${senderName}`} />
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            {this.renderTemplateFrigo()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}

TemplateFrigoCreate.contextTypes = {
    translator: PropTypes.object
};