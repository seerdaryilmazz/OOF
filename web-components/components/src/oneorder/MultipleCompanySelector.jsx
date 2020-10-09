import React from 'react';
import PropTypes from 'prop-types';

import {TranslatingComponent} from '../abstract';
import {Grid, GridCell, Card, CardSubHeader,} from '../layout'
import {Button, TextInput, Span} from '../basic';
import {RenderingComponent} from './RenderingComponent';
import {CompanySearchAutoComplete} from './CompanySearchAutoComplete';

export class MultipleCompanySelector extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {label: ""};

        if (props.data) {
            this.state.selectedCompanies = props.data;
        } else {
            this.state.selectedCompanies = [];
        }
        if (props.label) {
            this.state.label = props.label;
        }
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.data) {
            this.state.selectedCompanies = this.validateArray(nextProps.data);
        }
        this.setState(this.state);

    }

    validateArray(data) {
        if (!Array.isArray(data)) {
            let array = [];
            array.push(data);
            return array;
        }

        return data;
    }

    autoCompleteValueSelected(selected) {

        if (selected && selected.id) {
            selected.code = selected.id;
        }

        this.state.selectedCompanies.push(selected);

        this.props.handleDataUpdate(this.state.selectedCompanies);

        this.setState(this.state);
    }

    handleDeleteSelectedCompany(id) {

        let elemIndex = -1;

        this.state.selectedCompanies.forEach((s, i) => {
            if (s.id == id) {
                elemIndex = i;
            }
        });

        if (elemIndex > -1) {
            this.state.selectedCompanies.splice(elemIndex, 1);
        }

        this.props.handleDataUpdate(this.state.selectedCompanies);

        this.setState(this.state);
    }

    renderStandard() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <div className="uk-form-row">
                        <div className="md-input-wrapper md-input-filled">
                            <label>{this.state.label}</label>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <SelectedCompanyList data={this.state.selectedCompanies}
                                         deleteNodeHandler={(id) => this.handleDeleteSelectedCompany(id)}
                                         readOnly={this.props.readOnly}/>
                </GridCell>
                <GridCell noMargin={true} width="1-1">
                    <CompanySearchAutoComplete
                        value={null}
                        onchange={(value) => {this.autoCompleteValueSelected(value)}}/>
                </GridCell>
            </Grid>
        );
    }

    renderReadOnly() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <div className="uk-form-row">
                        <div className="md-input-wrapper md-input-filled">
                            <label>{this.state.label}</label>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <SelectedCompanyList data={this.state.selectedCompanies}
                                         deleteNodeHandler={(id) => this.handleDeleteSelectedCompany(id)}
                                         readOnly={this.props.readOnly}/>
                </GridCell>
            </Grid>
        );
    }

    render() {
        return RenderingComponent.render(this);
    }
}


export class SelectedCompanyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {
        this.state.selectedElems = this.props.data;
    }

    componentWillReceiveProps(nextProps) {

        this.state.selectedElems = nextProps.data;
        this.setState(this.state);
    }

    renderStandard() {

        if (!this.state.selectedElems) {
            return null;
        }

        return (
            <Grid>
                {
                    this.state.selectedElems.map(elem => {
                        return (
                            <GridCell key={elem.id} width="1-1" noMargin={true}>
                                <div style={{float:'left'}}>
                                    <span className="uk-text-small uk-text-muted">{elem.name }</span>
                                </div>
                                <div style={{float:'right'}}>
                                    <i onClick={(e) => this.props.deleteNodeHandler(elem.id)}
                                       className="sm-icon uk-icon-times"></i>
                                </div>
                            </GridCell>
                        );
                    })
                }
            </Grid>
        );

    }

    renderReadOnly() {

        if (!this.state.selectedElems) {
            return null;
        }

        return (
            <Grid>
                {
                    this.state.selectedElems.map(elem => {
                        return (
                            <GridCell key={elem.id} width="1-1" noMargin={true}>
                                {elem.name}
                            </GridCell>
                        );
                    })
                }
            </Grid>
        );

    }

    render() {
        return RenderingComponent.render(this);
    }
}

MultipleCompanySelector.contextTypes = {
    translator: PropTypes.object
};
