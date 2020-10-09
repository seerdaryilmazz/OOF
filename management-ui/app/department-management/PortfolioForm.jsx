import React from 'react';
import { Grid, GridCell } from 'susam-components/layout/Grid';
import { CustomerGroupSelector } from "../authorization/selector/CustomerGroupSelector";
import { CustomerGroupForm } from "../customerGroup/CustomerGroupForm";

export class PortfolioForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }

    handlePortfolioChange(value) {
        this.props.onChange && this.props.onChange(value);
    }

    renderAddPortfolio() {
        if (this.props.mode !== "ADD_NEW_PORTFOLIO") {
            return null;
        }
        return (
            <GridCell>
                <CustomerGroupSelector label="Portfolio"
                                       value={this.state.customerGroup}
                                       onChange={(value) => this.handlePortfolioChange(value)}/>
            </GridCell>
        );
    }

    renderNewPortfolio() {
        if (this.props.mode !== "CREATE_NEW_PORTFOLIO" && this.props.mode !== "EDIT_PORTFOLIO") {
            return null;
        }
        return (
            <GridCell>
                <CustomerGroupForm item={this.props.selectedCustomerGroup}
                                   onSave={(item) => this.handlePortfolioChange(item)} />
            </GridCell>
        );
    }

    render() {
        return (
            <Grid>
                {this.renderAddPortfolio()}
                {this.renderNewPortfolio()}
            </Grid>
        );
    }
}