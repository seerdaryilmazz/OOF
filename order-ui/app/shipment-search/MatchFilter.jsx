import React from "react";
import uuid from "uuid";
import {TextInput, Button} from 'susam-components/basic';
import {NumericInput} from "susam-components/advanced";
import {Grid, GridCell} from "susam-components/layout";

export class MatchFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {filter: {name: "", val: ""}};
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.matchFilter){
            this.setState({filter: nextProps.matchFilter});
        }
    }

    onChangeMatch(value, matchType) {
        let matchFilter = {
            name: matchType.name,
            val: value
        };
        this.setState({filter: matchFilter});
    }

    applyFilter(){
        this.props.changeMatchFilter(this.state.filter);
    }

    render() {
        let components = [];

        components.push(
            <div key = {this.props.matchType.name + "-name"}>
                <b>{this.props.matchType.name}</b>
            </div>
        );

        let value = this.state.filter ? this.state.filter.val : null;
        let filterInput = null;
        if (this.props.matchType.filterType == "NUMERIC") {
            filterInput = <NumericInput
                value={value}
                onchange={(value) => this.onChangeMatch(value, this.props.matchType)}
                digits="0"
                digitsOptional={true}
                unit=""
                placeholder=""/>;
        } else {
            filterInput = <TextInput
                        value={value}
                        onchange={(value) => this.onChangeMatch(value, this.props.matchType)}
                        placeholder=""/>;
        }
        components.push(
            <div key = {this.props.matchType.name + "-value"} style={{marginTop: "-15px"}}>
                <Grid>
                    <GridCell width="1-2" noMargin="true">
                        {filterInput}
                    </GridCell>
                    <GridCell width="1-2" noMargin="true">
                        <Button size="small" flat = {true} label="Apply" style="primary" onclick = {() => this.applyFilter()} />
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