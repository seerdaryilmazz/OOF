import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Checkbox, Notify, DropDown, Span, Form} from "susam-components/basic";
import {NumberInput} from "susam-components/advanced";

export class LineForm extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    handleSave(){
        if(!this.form.validate()){
            return;
        }
        this.props.onSave && this.props.onSave();
    }

    updateLtlScaleMax(index, value){
        let lineScale = _.cloneDeep(this.props.lineScale);
        lineScale.ltlScales[index].maximum = value;
        if(index < lineScale.ltlScales.length-1){
            lineScale.ltlScales[index+1].minimum = value;
        }

        this.validateLtlScales(lineScale);

        this.props.onChange && this.props.onChange(lineScale);
    }

    updateLtlScaleMin(index, value){
        let lineScale = _.cloneDeep(this.props.lineScale);
        lineScale.ltlScales[index].minimum = value;
        if(index > 0){
            lineScale.ltlScales[index-1].maximum = value;
        }
        this.validateLtlScales(lineScale);

        this.props.onChange && this.props.onChange(lineScale);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.lineScale){
            this.validateLtlScales(nextProps.lineScale);
        }
    }

    handleAddNewLtlScale(){
        this.props.onAddLtlScale && this.props.onAddLtlScale();
    }
    handleRemoveLtlScale(scale){
        this.props.onRemoveLtlScale && this.props.onRemoveLtlScale(scale);
    }

    validateLtlScales(lineScale){
        let prevMax = 0;
        let error = null;
        lineScale.ltlScales.forEach((scale, index) => {
            let min = scale.minimum ? _.toNumber(scale.minimum) : 0;
            let max = scale.maximum ? _.toNumber(scale.maximum) : null;
            if(max != null && min >= max){
                error = "Minimum value should be smaller than maximum value, check line " + (index+1);
            }
            if(index > 0 && min != prevMax){
                error = "Minimum value should be equal to previous line's maximum value";
            }
            prevMax = max;
        });

        this.setState({error: error});
    }

    isFtlScaleIncluded() {
        return !_.isEmpty(this.props.lineScale.ftlScales);
    }

    includeOrExcludeFtlScale(include) {

        let lineScale = _.cloneDeep(this.props.lineScale);

        if (include) {
            lineScale.ftlScales = [{
                _key: uuid.v4(),
                type: {
                    id: "FTL",
                    code: "FTL",
                    name: "FTL"
                }
            }];
        } else {
            lineScale.ftlScales = [];
        }

        this.props.onChange && this.props.onChange(lineScale);
    }

    renderLtlScales() {
        let components = [];
        let ltlScales = this.props.lineScale.ltlScales;
        ltlScales.forEach((scale, index) => {
            components.push(this.renderLtlScale(scale, index, index == ltlScales.length - 1));
        });
        return components;
    }

    renderLtlScale(scale, index, lastItem){

        let addButton = null;
        let removeButton = null;
        if(!this.props.priceTablesForLine){
            addButton = lastItem ? <Button label="add" style="success" size="small" onclick = {() => this.handleAddNewLtlScale()} /> : null;
            removeButton = <Button label="remove" flat = {true} style="danger" size="small" onclick = {() => this.handleRemoveLtlScale(scale)} />;
        }
        return (
            <Grid key = {scale._key}>
                <GridCell width="1-4">
                    <NumberInput label="Minimum (PW)" required = {true}
                                 value = {scale.minimum}
                                 onchange = {(value) => this.updateLtlScaleMin(index, value)} />
                </GridCell>
                <GridCell width="1-4">
                    <NumberInput label="Maximum (PW)" required = {!lastItem}
                                 value = {scale.maximum}
                                 onchange = {(value) => this.updateLtlScaleMax(index, value)} />
                </GridCell>
                <GridCell width="1-4">
                    <div className="uk-margin-top">
                        {addButton}
                        {removeButton}
                    </div>
                </GridCell>
                <GridCell width="1-4" />
            </Grid>
        );
    }

    renderWarning(){
        let message = null;
        if(this.props.priceTablesForLine > 0){
            message = `This line has ${this.props.priceTablesForLine} price tables using these scales`;
            return (
                <div className="uk-alert uk-alert-warning">{message}</div>
            );
        }
        return null;
    }
    renderAlert(){
        let alert = null;
        if(this.state.error){
            alert =
                <div className="uk-alert uk-alert-danger">
                    {this.state.error}
                </div>;
        }
        return alert;
    }

    renderFtlScale() {

        let isCheckboxDisabled = false;

        if (this.props.priceTablesForLine > 0) {
            isCheckboxDisabled = true;
        }

        return (
            <Checkbox label="FTL"
                      value={this.isFtlScaleIncluded()}
                      onchange={(value) => this.includeOrExcludeFtlScale(value)}
                      disabled={isCheckboxDisabled}/>
        );
    }

    render(){
        if(!this.props.lineScale){
            return null;
        }
        let fromCountryName = this.props.lineScale.line.fromCountry.name;
        let toCountryName = this.props.lineScale.line.toCountry.name;
        let alert = this.renderAlert();
        let warning = this.renderWarning();
        let messages = alert || warning ? <GridCell width="1-1">{warning}{alert}</GridCell> : null;
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title={fromCountryName + "-" + toCountryName} />
                </GridCell>
                {messages}
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-1" noMargin={true}>
                                {this.renderLtlScales()}
                            </GridCell>
                            <GridCell width="1-1">
                                {this.renderFtlScale()}
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-right">
                        <Button label="Save" style="primary" size="small" onclick = {() => this.handleSave()} disabled = {this.state.error} />
                    </div>
                </GridCell>
            </Grid>
        );
    }

}