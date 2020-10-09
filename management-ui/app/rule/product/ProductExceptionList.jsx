import _ from "lodash";
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Span} from "susam-components/basic";
import {Chip, NumericInput} from 'susam-components/advanced';

export class ProductExceptionList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {rules: []}
    }

    componentDidMount() {
        this.loadRules(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.loadRules(nextProps);
    }

    loadRules(props) {
        let rules = props.rules;
        if (rules) {
            rules.forEach(rule => {
                if (!rule._guiKey) {
                    rule._guiKey = uuid.v4();
                }
            });
            this.setState({rules: rules});
        } else {
            this.setState({rules: []});
        }
    }

    renderListElem(elem) {

        return (
            <GridCell key={elem._guiKey} width="3-4" noMargin={true}>
                <Grid>
                    <GridCell width="8-10">
                        <span className="uk-text-primary">
                            If {elem.operationType.name} category
                            is {elem.categories.map(r => r.name).join(" or ")}, {elem.additionalDay} workday(s)
                            should be added to transit time
                        </span>
                    </GridCell>
                    <GridCell width="1-10">
                        <Button label="delete" size="small" style="danger" waves={true} flat={true}
                                onclick={ () => {
                                    this.props.deleteHandler(elem)
                                }}/>
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }

    render() {
        let rules = this.state.rules;
        if (!rules || rules.length == 0) {
            return null;
        }

        return (
            <Grid>
                {rules.map(ruleElem => this.renderListElem(ruleElem))}
            </Grid>
        );
    }
}