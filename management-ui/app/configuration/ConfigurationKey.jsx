import React from "react";
import ReactDOM from "react-dom";
import { Chip } from "susam-components/advanced";
import { Button, DropDown, Form, Notify, TextInput } from "susam-components/basic";
import { Card, Grid, GridCell } from "susam-components/layout";
import { Modal } from "susam-components/layout/Modal";
import { ConfigurationManagementKeyService } from "../services";

var handleChange;

export class ConfigurationKey extends React.Component {
    VALUE_FIELDS = {
        LOOKUP: {
            component: () => <TextInput label="Lookup url" required={true} value={this.state.value.dataSource} onchange={value=>this.handleChange({'dataSource': value})} />
        },
        LIST: {
            component: () => <Button label="define list" style="success" size="small" flat={true} onclick={() => this.listModel.open()} />
        }
    }

    state = {
        value: {}
    };

    constructor(props) {
        super(props);
        handleChange = (changes) => this.handleChange(changes);
    }

    componentDidMount() {
        this.setState({ value: _.cloneDeep(this.props.value) });
        $('input', ReactDOM.findDOMNode(this.codeField)).blur(function () {
            let val = _.toUpper(_.snakeCase($(this).val()));
            handleChange({ code: _.toUpper(val) });
        });
    }

    renderValueField() {
        if (this.state.value.valueType) {
            let field = this.VALUE_FIELDS[this.state.value.valueType.code];
            return field && field.component();
        }
        return null;
    }

    handleChange(changes) {
        this.setState(prevState => {
            for (let key in changes) {
                _.set(prevState.value, key, _.get(changes, key));
            }
            return prevState;
        });
    }

    handleCancel() {
        this.props.onCancel && this.props.onCancel();
    }

    handleSave() {
        if (this.form.validate()) {
            ConfigurationManagementKeyService.save(this.state.value).then(response => {
                Notify.showSuccess("Saved");
                this.props.onSave && this.props.onSave(response.data);
            }).catch(error => Notify.show.error(error));
        }
    }

    render() {
        return (
            <Card>
                <Form ref={c => this.form = c}>
                    <Grid>
                        <GridCell width="1-2">
                            <TextInput label="Code" required={true}
                                ref={c => this.codeField = c}
                                readOnly={this.state.value.id}
                                value={this.state.value.code}
                                onchange={value => this.handleChange({ code: value })} />
                        </GridCell>
                        <GridCell width="1-2">
                            <TextInput label="Name" required={true}
                                value={this.state.value.name}
                                onchange={value => this.handleChange({ name: value })} />
                        </GridCell>
                        <GridCell width="1-2">
                            <DropDown label="Value Type" required={true} options={this.props.valueTypes}
                                value={this.state.value.valueType}
                                onchange={value => this.handleChange({ valueType: value })} />
                        </GridCell>
                        <GridCell width="1-2">
                            {this.renderValueField()}
                        </GridCell>
                        <GridCell width="1-2">
                            <Chip options={this.props.operations} valueField="name" label="Authorizations"
                                value={_.defaultTo(this.state.value.authorizations,[]).map(i=>({name: i}))}
                                onchange={value=>this.handleChange({authorizations: _.defaultTo(value,[]).map(i=>i.name)})}/>
                        </GridCell>
                        <GridCell width="1-2" />
                        <GridCell width="1-2" />
                        <GridCell width="1-2" style={{ textAlign: "right" }}>
                            <Button label="cancel" onclick={() => this.handleCancel()} />
                            <Button label="save" style="primary" onclick={() => this.handleSave()} />
                        </GridCell>
                    </Grid>
                </Form>
                <Modal ref={c => this.listModel = c}
                    onopen={() => this.setState({ lookupValues: _.isArray(this.state.value.dataSource)?this.state.value.dataSource:[] })}
                    onclose={() => this.setState({ lookupValues: undefined })}>
                    <ConfigurationList value={this.state.lookupValues}
                        onSave={() => { this.handleChange({ dataSource: this.state.lookupValues }); this.listModel.close() }}
                        onchange={value => this.setState({ lookupValues: value })} />
                </Modal>
            </Card>
        )
    }
}

class ConfigurationList extends React.Component {

    static defaultProps = {
        value: []
    };

    handleAdd() {
        let value = _.cloneDeep(this.props.value);
        value.push({})
        this.props.onchange && this.props.onchange(value);
    }

    handleChange(index, item) {
        let value = _.cloneDeep(this.props.value);
        value[index] = item;
        this.props.onchange && this.props.onchange(_.reject(value, _.isNil));
    }

    handleSave() {
        if (this.form.validate()) {
            this.props.onSave && this.props.onSave();
        }
    }

    render() {
        return (<Form ref={c => this.form = c}>
            <Grid>
                <GridCell width="1-1">
                    <Button style="success" label="add" fullWidth={true} onclick={() => this.handleAdd()} />
                </GridCell>
                {(_.isArray(this.props.value)?this.props.value:[]).map((item, index) => <Param key={index} item={item} onchange={item => this.handleChange(index, item)} onRemove={() => this.handleChange(index)} />)}
                <GridCell width="1-1" style={{ textAlign: "right" }}>
                    <Button flat={true} style="primary" label="ok" onclick={() => this.handleSave()} />
                </GridCell>
            </Grid>
        </Form>)
    }
}

var handleParamChange;
class Param extends React.Component {

    constructor(props) {
        super(props);
        handleParamChange = (key, value) => this.handleChange(key, value);
    }

    componentDidMount() {
        $('input', ReactDOM.findDOMNode(this.codeField)).blur(function () {
            let val = _.toUpper(_.snakeCase($(this).val()));
            handleParamChange('code', _.toUpper(val));
        });
    }

    handleChange(key, value) {
        let item = this.props.item;
        _.set(item, key, value);
        this.props.onchange && this.props.onchange(item);
    }

    render() {
        return (
            <GridCell width="1-1">
                <Grid collapse={true}>
                    <GridCell width="2-5" noMargin={true}>
                        <TextInput ref={c => this.codeField = c} required={true} label="Code" value={this.props.item.code} onchange={value => this.handleChange('code', value)} />
                    </GridCell>
                    <GridCell width="2-5" noMargin={true}>
                        <TextInput required={true} label="Name" value={this.props.item.name} onchange={value => this.handleChange('name', value)} />
                    </GridCell>
                    <GridCell width="1-5">
                        <Button mdIcon="remove" iconColorClass="md-color-red-500" style="danger"
                            flat={true} onclick={() => this.props.onRemove && this.props.onRemove()} />
                    </GridCell>
                </Grid>
            </GridCell>
        )
    }
}