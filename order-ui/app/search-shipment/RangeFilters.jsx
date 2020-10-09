import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { DateRange, NumericInput } from "susam-components/advanced";
import { Button } from "susam-components/basic/Button";
import { Grid, GridCell } from "susam-components/layout";
import uuid from "uuid";

export class RangeFilters extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = { showCancelButton: !_.isNil(this.props.rangeFilter) }
    }

    onChangeRange(values, rangeType, presetName) {
        let rangeFilter = {
            name: rangeType.name,
            presetName: presetName
        };

        if (rangeType.filterType == "DATE") {
            rangeFilter.gte = values.startDate;
            rangeFilter.lte = values.endDate;
        } else if (rangeType.filterType == "NUMERIC") {
            rangeFilter.gte = values.gte;
            rangeFilter.lte = values.lte;
        }

        this.setState({
            showCancelButton: true
        });
        this.props.changeRangeFilter(rangeFilter);
    }

    componentDidMount() {
        this.arrangeMinMaxDates();
    }

    componentDidUpdate() {
        this.arrangeMinMaxDates();
    }

    arrangeMinMaxDates() {
        if (this.props.rangeType.filterType != "DATE") {
            return;
        }
        var $dp_start = $("#" + this.dateRangeComponent.state.startId);
        var start_date = $.UIkit.datepicker($dp_start);

        var $dp_end = $("#" + this.dateRangeComponent.state.endId);
        var end_date = $.UIkit.datepicker($dp_end);

        if (!_.isEmpty($dp_end.val())) 
            start_date.options.maxDate = $dp_end.val();
        
        if (!_.isEmpty($dp_start.val())) 
            end_date.options.minDate = $dp_start.val();
        
    }

    removeRangeFilter(rangeFilter) {
        this.props.removeRangeFilter(rangeFilter);
        this.setState({
            showCancelButton: false
        });
    }

    setDates(preset, rangeType) {
        let val = {
            startDate: preset.minimumRange,
            endDate: preset.maximumRange
        }
        this.onChangeRange(val, rangeType, preset.name)
    }

    render() {
        let components = [];

        let cancelButton = <a href="javascript:;" className="md-icon uk-icon-button uk-icon-remove" onClick={() => this.removeRangeFilter(this.props.rangeFilter)} />

        components.push(
            <div key={uuid.v4()}>
                <b>{super.translate(this.props.rangeType.name)}</b>
            </div>
        );

        let presets = null;
        if (this.props.presets && this.props.presets.length > 0) {
            presets = <ul style={{ listStyleType: "none", margin: "0px 20px", padding: "8px 2px", overflow: "hidden" }}>
                {this.props.presets.map(preset =>
                    <li key={uuid.v4()} style={{ float: "left" }}>
                        <Button key={uuid.v4()}
                            label={preset.name}
                            size="small"
                            onclick={() => this.setDates(preset, this.props.rangeType)}
                            style={preset.selected ? "primary" : ""}
                        />
                    </li>
                )}
            </ul>
        }

        let functions = <Grid collapse={true}>
            <GridCell width="5-6" noMargin={true}>
                {presets}
            </GridCell>
            <GridCell width="1-6" noMargin={true} style={{ padding: "0.6em 0.2em" }}>
                {this.state.showCancelButton ? cancelButton : null}
            </GridCell>
        </Grid>

        if (this.props.rangeType.filterType == "DATE") {
            let dateRangeValue = {
                startDate: null,
                endDate: null
            }

            if (this.props.rangeFilter) {
                dateRangeValue.startDate = this.props.rangeFilter.gte ? this.props.rangeFilter.gte : null;
                dateRangeValue.endDate = this.props.rangeFilter.lte ? this.props.rangeFilter.lte : null;
            }

            components.push(
                <div key={uuid.v4()}>
                    <div key={uuid.v4()} className="dateRangeFilter">
                        {functions}
                        <DateRange
                            ref={(c) => this.dateRangeComponent = c}
                            key={uuid.v4()}
                            vertical={false}
                            onchange={(values) => this.onChangeRange(values, this.props.rangeType)}
                            value={dateRangeValue}
                            noMargin="true"
                        />
                    </div>
                </div>
            )
        } else if (this.props.rangeType.filterType == "NUMERIC") {
            let values = {
                gte: '',
                lte: ''
            };

            if (this.props.rangeFilter) {
                values.gte = this.props.rangeFilter.gte ? this.props.rangeFilter.gte : '';
                values.lte = this.props.rangeFilter.lte ? this.props.rangeFilter.lte : '';
            }

            components.push(
                <div key={uuid.v4()} style={{ marginTop: "-15px" }}>
                    <Grid key={uuid.v4()}>
                        {functions}
                        <GridCell key={uuid.v4()} width="1-2" noMargin="true">
                            <NumericInput
                                value={values.gte}
                                onchange={(value) => this.onChangeRange({
                                    gte: value,
                                    lte: values.lte
                                }, this.props.rangeType)}
                                digits="3"
                                digitsOptional={true}
                                unit=""
                                placeholder="min" />
                        </GridCell>
                        <GridCell key={uuid.v4()} width="1-2" noMargin="true">
                            <NumericInput
                                value={values.lte}
                                onchange={(value) => this.onChangeRange({
                                    gte: values.gte,
                                    lte: value
                                }, this.props.rangeType)}
                                digits="3"
                                digitsOptional={true}
                                unit=""
                                placeholder="max" />
                        </GridCell>
                    </Grid>
                </div>
            );
        }

        return (
            <div key={uuid.v4()} className="bucket">
                <div>
                    {components}
                </div>
            </div>
        );
    }
}

RangeFilters.contextTypes = {
    translator: PropTypes.object
};