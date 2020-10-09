import React from "react";
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown, TextInput} from 'susam-components/basic';
import {NumericInput} from 'susam-components/advanced';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";

export class MultipleSelector extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data:{}
        }


    }

    static RAMPSELECTION_ALL_RAMPS = {id:"ALL", code: "All", name:"All"};
    static RAMPSELECTION_REMAINING_RAMPS = {id:"REMAINING", code: "Remaining", name:"Remaining"};
    static RAMPSELECTION_SPECIFIC_RAMPS = {id:"SPECIFIC", code: "Specific", name:"Specific"};

    elemSelected(data) {
        if (!data) return;

        let value = this.props.value;

        if (!value) {
            value = [];
        }

        if (data.id == "ALL" || data.id == "REQUIRED") {
            value = [];
            value.push(data);
        } else {
            value.push(data);
        }

        this.props.onchange(value);

    }

    deleteElem(id) {

        if(!id) {
            return;
        }
        let value = this.props.value;


        let elemIndex = value.findIndex(v => v.id == id);
        if (elemIndex < 0) return false;
        value.splice(elemIndex, 1);

        this.props.onchange(value);
    }


    render () {

        let options;

        if(!this.props.options) {
            options = [];
        } else {
            options = _.cloneDeep(this.props.options);
        }

        options.splice(0, 0, MultipleSelector.RAMPSELECTION_ALL_RAMPS);
        options.splice(1, 0, MultipleSelector.RAMPSELECTION_REMAINING_RAMPS);

        let selectedElems = [];

        if(this.props.value) {
            if(this.props.value.filter(v => v.id == "ALL" || v.id == "REMAINING").length > 0) {
                options = [];
            } else {
                let ids = this.props.value.map(v => v.id);
                options = options.filter(o => !ids.includes(o.id));
            }

            this.props.value.forEach(v => {
                selectedElems.push(<a key={"a" +v.id} onClick={() => {this.deleteElem(v.id)}}>{v.name}</a>);
                selectedElems.push(<span key={"s" + v.id}> </span>);
            })
        }


        return (
            <Grid>
                <GridCell width="1-2" >
                    {selectedElems}
                </GridCell>
                <GridCell width="1-2" noMargin={true}>
                    <DropDown options={options}
                              onchange={(data) => {this.elemSelected(data)}}/>
                </GridCell>

            </Grid>
        )
    }
}