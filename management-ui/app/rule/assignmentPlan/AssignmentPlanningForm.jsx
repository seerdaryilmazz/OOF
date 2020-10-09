import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, DropDown, Form, Span, TextInput} from "susam-components/basic";
import {NumericInput} from "susam-components/advanced";

import {AssignmentPlanningRuleService} from "../../services";

export class AssignmentPlanningForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        this.findRegionAndType(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.findRegionAndType(nextProps);
    }

    validate() {
        return this.form.validate();
    }

    updateData(field, value) {
        this.props.ruleSetDataUpdateHandler(field, value);
    }

    findRegionAndType(props) {
        let data = props.data;
        let lookup = props.lookup;

        if (data && data.operationRegion && data.ruleType && lookup && lookup.operationRegion) {
            let operationRegion = _.find(lookup.operationRegion, {id: data.operationRegion.id});
            switch (data.ruleType.id) {
                case AssignmentPlanningRuleService.RULETYPE_LINEHAUL_ID:
                case AssignmentPlanningRuleService.RULETYPE_COLLECTION_ID:
                    this.setState({colDistRegion: operationRegion.collectionRegions});
                    break;
                case AssignmentPlanningRuleService.RULETYPE_DISTRIBUTION_ID:
                    this.setState({colDistRegion: operationRegion.distributionRegions});
                    break;
            }
        }
    }

    render() {

        let data = this.props.data;
        let lookup = this.props.lookup;

        if (!data || !lookup) {
            return null;
        }

        let label = data.ruleType ?
             (data.ruleType.id === AssignmentPlanningRuleService.RULETYPE_DISTRIBUTION_ID) ?
                "Distribution Region"
                : "Collection Region"
        : "Region";

        return (
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardHeader title="Assignment Planning Form"/>
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <Grid>
                            <GridCell width="1-4">
                                <DropDown options={lookup.types}
                                          readOnly={data.id}
                                          label="Type"
                                          value={data.ruleType}
                                          onchange={(value) => this.updateData("ruleType", value)}
                                          required={true}/>
                            </GridCell>
                        </Grid>
                        <Grid>
                            <GridCell width="1-4">
                                <DropDown options={lookup.operationRegion}
                                          label="Operation Region"
                                          value={data.operationRegion}
                                          onchange={(value) => this.updateData("operationRegion", value)}
                                          required={true}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown options={this.state.colDistRegion}
                                          label={label}
                                          value={data.region}
                                          onchange={(value) => this.updateData("region", value)}
                                          required={true}/>
                            </GridCell>
                            <GridCell width="1-4" hidden={!data.ruleType || data.ruleType.id != AssignmentPlanningRuleService.RULETYPE_LINEHAUL_ID}>
                                <DropDown options = {lookup.loadTypes}
                                          label="Load Type"
                                          value = {data.loadType}
                                          onchange = {(value) => this.updateData("loadType", value)}
                                          required={true}/>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}
