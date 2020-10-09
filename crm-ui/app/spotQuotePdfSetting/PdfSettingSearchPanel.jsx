import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import _ from "lodash";
import {GridCell, Grid} from "susam-components/layout";
import {DropDown} from "susam-components/basic";

export class PdfSettingSearchPanel extends TranslatingComponent {
    constructor(props){
        super(props);
    }

    handleChange(value){
        if(this.props.onChange){
            let searchParams = _.defaultTo(this.props.searchParams, {});
            for(let key in value){
                _.set(searchParams, key, value[key]);
            }
            this.props.onChange(searchParams);
        }
    }

    extractOptions(field, list = _.defaultTo(this.props.list, [])){
        let extractedList = _.reject(list.map(i=>_.get(i, field)), _.isNil);
        return _.sortBy(_.uniqWith(extractedList, (a,b)=>a.name === b.name), 'name');
    }

    render(){
        return (
            <Grid collapse={false}>
                <GridCell width="1-4">
                    <DropDown valueField="id" labelField="name"
                              value={_.get(this.props.searchParams, 'subsidiary')}
                              options={this.extractOptions('subsidiary')}
                              onchange={value => this.handleChange({subsidiary: value})} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown valueField="code" labelField="name"
                        value={_.get(this.props.searchParams, 'serviceArea')}
                              options={this.extractOptions('serviceArea')}
                              onchange={value => this.handleChange({serviceArea: value})} />
                </GridCell>
                <GridCell width="1-4">
                    <DropDown valueField="isoCode" labelField="name"
                              value={_.get(this.props.searchParams, 'language')}
                              options={this.extractOptions('language')}
                              onchange={value => this.handleChange({language: value})} />
                </GridCell>
                <GridCell width="1-4">
                </GridCell>
            </Grid>
        );
    }
}