import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Form, Notify, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell } from 'susam-components/layout';
import { PricingRuleService } from '../../services';

let handleChange;

export class TariffGroup extends React.Component {
    state = {
        tariffGroup: {}
    };

    constructor(props) {
        super(props);
        handleChange = (values) => this.handleChange(values);
        if (this.props.tariffGroup) {
            this.state = {
                tariffGroup: _.cloneDeep(this.props.tariffGroup)
            };
        }
    }

    componentDidMount() {
        $('input', ReactDOM.findDOMNode(this.codeField)).blur(function () {
            let val = _.toUpper(_.snakeCase($(this).val()));
            handleChange({ code: _.toUpper(val) });
        });
    }

    handleChange(values) {
        this.setState(prevState => {
            for (let key in values) {
                _.set(prevState.tariffGroup, key, values[key]);
                return prevState;
            }
        })
    }

    handleSave() {
        if (!this.tariffGroupForm.validate()) {
            return;
        }
        PricingRuleService.saveTariffGroup(this.state.tariffGroup).then(response => {
            this.setState({ tariffGroup: response.data });
            Notify.showSuccess("Tariff Group saved");
            this.props.onSave && this.props.onSave(response.data);
        }).catch(error => Notify.showError(error));
    }

    handleCancel() {
        this.props.onCancel && this.props.onCancel();
    }

    render() {
        return (
            <Card>
                <Form ref={c => this.tariffGroupForm = c}>
                    <Grid>
                        <GridCell width="1-3">
                            <TextInput required={true} label="Name" value={this.state.tariffGroup.name} onchange={value => this.handleChange({ name: value })} />
                        </GridCell>
                        <GridCell width="1-3">
                            <TextInput ref={c => this.codeField = c} readOnly={this.state.tariffGroup.id} required={true} label="Code" value={this.state.tariffGroup.code} onchange={value => this.handleChange({ code: value })} />
                        </GridCell>
                        <GridCell width="1-3">
                            <Button label="save" style="success" onclick={() => this.handleSave()} />
                            <Button label="cancel" onclick={() => this.handleCancel()} />
                        </GridCell>
                    </Grid>
                </Form>
            </Card>
        )
    }
}