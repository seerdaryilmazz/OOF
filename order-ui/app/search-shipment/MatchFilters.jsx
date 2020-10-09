import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract/TranslatingComponent";
import { NumericInput } from "susam-components/advanced";
import { TextInput } from 'susam-components/basic';
import { Grid, GridCell } from "susam-components/layout";

export class MatchFilters extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = { filter: { name: this.props.matchType.name, val: "" } };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.matchFilter) {
            this.setState({
                filter: nextProps.matchFilter,
                showCancelButton: false
            });
        }
    }

    onChangeMatch(value, matchType) {
        let matchFilter = {
            name: matchType.name,
            val: value
        };
        this.setState({ filter: matchFilter });
    }

    applyFilter(isCancel) {
        this.setState({ showCancelButton: "" != this.state.filter.val && isCancel })
        if (!isCancel) {
            this.onChangeMatch("", this.props.matchType);
            this.props.removeMatchFilter(this.props.matchType)
            return;
        }
        this.props.changeMatchFilter(this.state.filter);
    }

    render() {
        let cancelButton = null;

        if (this.state.showCancelButton) {
            cancelButton =
                <a href="javascript:;"
                    className="md-icon uk-icon-button uk-icon-remove"
                    onClick={() => this.applyFilter(false)} />;
        }
        let applyButton =
            <a href="javascript:;" className="md-icon uk-icon-button" onClick={() => this.applyFilter(true)}>
                <i className="material-icons">done</i>
            </a>;
        let components = [];

        components.push(
            <div key={this.props.matchType.name + "-name"}>
                <b>{super.translate(this.props.matchType.name)}</b>
            </div>
        );

        let value = this.state.filter ? this.state.filter.val : "";
        let filterInput = null;
        if (this.props.matchType.filterType == "NUMERIC") {
            filterInput = <NumericInput
                ref={c => this.input = c}
                value={value}
                onchange={(value) => this.onChangeMatch(value, this.props.matchType)}
                digits="0"
                digitsOptional={true}
                unit=""
                placeholder="" />;
        } else {
            filterInput = <TextInput
                ref={c => this.input = c}
                value={value}
                onchange={(value) => this.onChangeMatch(value, this.props.matchType)}
                placeholder="" />;
        }
        components.push(
            <div key={this.props.matchType.name + "-value"} style={{ marginTop: "-5px" }}>
                <Grid>
                    <GridCell width="3-5">
                        <div className="savedSearchesInput">
                            {filterInput}
                        </div>
                    </GridCell>
                    <GridCell width="2-5" >
                        <div className="savedSearchesActions">
                            {applyButton}
                            {cancelButton}
                        </div>
                    </GridCell>
                </Grid>
            </div>
        );

        return (
            <div className="bucket">
                <div>
                    {components}
                </div>
            </div>
        );
    }
}

MatchFilters.contextTypes = {
    translator: PropTypes.object
};