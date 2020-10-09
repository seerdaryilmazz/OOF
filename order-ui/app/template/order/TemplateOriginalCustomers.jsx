import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';

export class TemplateOriginalCustomers extends TranslatingComponent {
    
    constructor(props){
        super(props);
        this.state = {}
    }

    handleAddOriginalCustomer() {
        if (!this.state.originalCustomer || !this.state.originalCustomer.id) {
            return;
        }
        let originalCustomers = _.cloneDeep(this.props.value);
        if (!originalCustomers) {
            originalCustomers = [];
        }
        originalCustomers.push(this.state.originalCustomer);
        this.setState({ originalCustomer: null }, () => this.props.onChange(originalCustomers))
    }
    handleDeleteOriginalCustomer(value) {
        let originalCustomers = _.cloneDeep(this.props.value);
        _.remove(originalCustomers, { id: value.id });
        this.props.onChange(originalCustomers);
    }

    renderList(value, showRemoveButton) {
        if (!_.isArray(value)) {
            return "No Selection";
        }
        return (
            <ul className="md-list">
                {
                    value.map(item => {
                        let removeButton = null;
                        if (showRemoveButton) {
                            removeButton = <Button label="delete" style="danger" size="small" flat={true}
                                onclick={() => this.handleDeleteOriginalCustomer(item)} />;
                        }
                        return (
                            <li key={item.id}>
                                <Grid>
                                    <GridCell width="4-5" noMargin={true}>{item.name}</GridCell>
                                    <GridCell width="1-5" noMargin={true}>
                                        {removeButton}
                                    </GridCell>
                                </Grid>
                            </li>
                        );
                    })
                }
            </ul>
        );
    }

    renderEditable(value) {
        let component = [];
        if (this.props.showAddNew) {
            component.push(<GridCell width="4-5" noMargin={true}>
                <CompanySearchAutoComplete label="Original Customer"
                    value={this.state.originalCustomer}
                    onchange={(value) => this.setState({ originalCustomer: value })} />
            </GridCell>);
            component.push(
                <GridCell width="1-5" noMargin={true}>
                    <div className="uk-margin-top">
                        <Button label="add" size="small" style="primary"
                            onclick={() => this.handleAddOriginalCustomer()} />
                    </div>
                </GridCell>
            );
        }
        return (
            <Grid>
                {component}
                <GridCell width="1-1">
                    {this.renderList(value, true)}
                </GridCell>
            </Grid>
        );
    }

    renderReadOnly(value) {
        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <span className="label">Original Customer</span>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    {this.renderList(value, false)}
                </GridCell>
            </Grid>
        );
    }

    render() {
        let { value, readOnly } = this.props;
        if (readOnly) {
            return this.renderReadOnly(value);
        } else {
            return this.renderEditable(value);
        }
    }

}
TemplateOriginalCustomers.propTypes = {
    value: PropTypes.object,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func,
    showAddNew: PropTypes.bool
}

TemplateOriginalCustomers.defaultProps = {
    showAddNew: true
};