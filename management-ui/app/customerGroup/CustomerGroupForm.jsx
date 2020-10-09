import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { CompanyAdd } from "./CompanyAdd";
import { CustomerGroupCompanies } from "./CustomerGroupCompanies";
import { CustomerGroupInfo } from "./CustomerGroupInfo";

export class CustomerGroupForm extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { item: this.props.item }
    }

    componentWillReceiveProps(nextProps){
        this.setState({ item: nextProps.item })
    }

    handleInfoChange(item) {
        let customerGroup = _.clone(this.state.item);
        customerGroup.name = item.name;
        this.setState({ item: customerGroup });
    }

    handleSave() {
        this.props.onSave && this.props.onSave(this.state.item);
    }

    handleCompanyAdd(item) {
        let customerGroup = _.clone(this.state.item);
        let found = _.find(customerGroup.companies, (n) => {
            return _.isEqual(n.id, item.id);
        });
        if (!_.isNil(found)) {
            Notify.showError("Company is exist in list");
            return;
        }
        customerGroup.companies.push({ id: item.id, name: item.value });
        this.setState({ item: customerGroup });
    }

    handleCompanyDelete(item) {
        let customerGroup = _.clone(this.state.item);
        _.remove(customerGroup.companies, (n) => {
            return _.isEqual(n.id, item.id);
        });
        this.setState({ item: customerGroup });
    }

    render() {
        return (
            <div>
                <Grid>
                    <GridCell width="1-1">
                        <CustomerGroupInfo item={this.state.item} onchange={(item) => this.handleInfoChange(item)} />
                    </GridCell>
                    <GridCell width="1-1" >
                        <CompanyAdd onAdd={(item) => this.handleCompanyAdd(item)} />
                    </GridCell>
                    <GridCell width="1-1">
                        <CustomerGroupCompanies list={this.state.item.companies}
                            onDelete={(item) => this.handleCompanyDelete(item)} />
                    </GridCell>
                </Grid>
                <div className="uk-align-right uk-margin-top">
                    <Button label="Save" size="small" style="primary" onclick={() => this.handleSave()} />
                </div>
            </div>
        );
    }
}