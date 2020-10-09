import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, TextInput } from "susam-components/basic";
import { CardHeader, Grid, GridCell } from "susam-components/layout";
import { CompanySearchAutoComplete } from "susam-components/oneorder";

export class Filter extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { filter: {}, values:{} };
    }

    updateFilterState(key, value, paramKey) {
        let filter = _.cloneDeep(this.state.filter);
        filter[key] = paramKey ? _.get(value,paramKey) : value;
       
        let values = _.cloneDeep(this.state.values);
        values[key] = value;

        this.setState({ filter: filter, values: values });
    }

    handleSearchClick() {
        this.props.onSearch && this.props.onSearch(this.state.filter);
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Filter" />
                </GridCell>
                <GridCell width="2-5">
                    <TextInput label="Group Name"
                        value={this.state.values.groupName}
                        onchange={(value) => this.updateFilterState("groupName", value)} />
                </GridCell>
                <GridCell width="2-5">
                    <CompanySearchAutoComplete
                        showShortName={true}
                        value={this.state.values.companyName}
                        onchange={(value) => this.updateFilterState("companyName", value, "value")} 
                        onclear={() => this.updateFilterState("companyName", null)}/>
                </GridCell>
                <GridCell width="1-5">
                    <div className="uk-align-right uk-margin-top">
                        <Button label="search" style="success" waves={true} size="small" onclick={() => this.handleSearchClick()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}