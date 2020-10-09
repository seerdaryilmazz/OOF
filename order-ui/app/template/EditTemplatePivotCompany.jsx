import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { CardHeader, Grid, GridCell } from 'susam-components/layout';
import { TemplateParty } from './TemplateParty';



export class EditTemplatePivotCompany extends TranslatingComponent {
    state = {};

    componentDidMount(){

    }

    handleChange(key, value){
        let pivot = _.cloneDeep(this.props.pivot);
        pivot[key] = value;
        this.props.onChange && this.props.onChange(pivot);
    }
    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleTypeChange(e, value){
        e.stopPropagation();
        if(this.props.pivot.type){
            Notify.confirm("Changing type will switch all customized templates, Are you sure ?", () => this.changeType(value));
        }else{
            this.changeType(value);
        }
    }
    changeType(value){
        let pivot = _.cloneDeep(this.props.pivot);
        pivot.type = value;
        this.props.onChange && this.props.onChange(pivot);
    }

    render(){
        let {pivot, owner} = this.props;
        let senderButtonClass = "md-btn md-btn-flat md-btn-block md-btn-flat-primary";
        let consigneeButtonClass = "md-btn md-btn-flat md-btn-block md-btn-flat-primary";
        let templateParty = null;
        if(pivot && pivot.type === "SENDER"){
            senderButtonClass += " uk-active";
            templateParty = <TemplateParty party = {pivot} owner = {owner} type = "sender"
                                           onChange = {(key, value) => this.handleChange(key, value)}/>;
        } else if (pivot && pivot.type === "CONSIGNEE"){
            consigneeButtonClass += " uk-active";
            templateParty = <TemplateParty party = {pivot} owner = {owner} type = "consignee"
                                           onChange = {(key, value) => this.handleChange(key, value)}/>;
        }
        return (
            <div>
                <CardHeader title = "Pivot Company & Location" />
                <Grid>
                    <GridCell width="1-2" noMargin = {true}>
                        <a className={senderButtonClass}
                           onClick = {(e) => this.handleTypeChange(e, "SENDER")}>sender is pivot</a>
                    </GridCell>
                    <GridCell width="1-2" noMargin = {true}>
                        <a className={consigneeButtonClass}
                           onClick = {(e) => this.handleTypeChange(e, "CONSIGNEE")}>consignee is pivot</a>
                    </GridCell>
                    <GridCell>
                        {templateParty}
                    </GridCell>
                </Grid>
            </div>
        );
    }

}