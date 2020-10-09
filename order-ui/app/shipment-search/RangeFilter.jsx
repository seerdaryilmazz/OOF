import React from "react";
import uuid from "uuid";
import {DateRange, NumericInput} from "susam-components/advanced";
import {Grid, GridCell} from "susam-components/layout";

export class RangeFilter extends React.Component {

    constructor(props) {
        super(props);
    }

    onChangeRange(values, rangeType) {
        let rangeFilter = {
            name: rangeType.name
        };

        if (rangeType.filterType == "DATE") {
            rangeFilter.gte = values.startDate;
            rangeFilter.lte = values.endDate;
        } else if (rangeType.filterType == "NUMERIC") {
            rangeFilter.gte = values.gte;
            rangeFilter.lte = values.lte;
        }

        this.props.changeRangeFilter(rangeFilter);
    }

    render() {
        let components = [];

        components.push(
            <div key={uuid.v4()}>
                <b>{this.props.rangeType.name}</b>
            </div>
        );

        if (this.props.rangeType.filterType == "DATE") {
            let dateRangeValue = {
                startDate: '',
                endDate: ''
            }

            if (this.props.rangeFilter) {
                dateRangeValue.startDate = this.props.rangeFilter.gte ? this.props.rangeFilter.gte : '';
                dateRangeValue.endDate = this.props.rangeFilter.lte ? this.props.rangeFilter.lte : '';
            }

            components.push(
                <div key={uuid.v4()} style={{marginTop: "-15px"}}>
                    <div key={uuid.v4()} className="dateRangeFilter">
                        <DateRange key={uuid.v4()}
                                   onchange={(values) => this.onChangeRange(values, this.props.rangeType)}
                                   value={dateRangeValue}
                                   noMargin="true"/>
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
                <div key={uuid.v4()} style={{marginTop: "-15px"}}>
                    <Grid key={uuid.v4()}>
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
                                placeholder="min"/>
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
                                placeholder="max"/>
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