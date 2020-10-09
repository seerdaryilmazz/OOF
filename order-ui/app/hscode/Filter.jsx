import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput } from "susam-components/advanced";
import { Button, TextInput } from "susam-components/basic";
import { CardHeader, Grid, GridCell } from "susam-components/layout";

export class Filter extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { filter: this.props.filter }
    }

    updateFilterState(key, value) {
        let filter = _.cloneDeep(this.state.filter);
        filter[key] = value;
        this.setState({ filter: filter });
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
                <GridCell width="1-4">
                    <TextInput label="Definition"
                        style={{textTransform: "uppercase"}}
                        value={this.state.filter.name}
                        onchange={(value) => this.updateFilterState("name", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <NumberInput label="HS Code (Starts with)"
                        maxLength="12"
                        value={this.state.filter.code}
                        onchange={(value) => this.updateFilterState("code", value)} />
                </GridCell>
                <GridCell width="1-4">
                    <div className="uk-align-left uk-margin-top">
                        <Button label="search" style="success" waves={true} size="small" onclick={() => this.handleSearchClick()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}