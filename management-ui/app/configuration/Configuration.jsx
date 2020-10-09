import * as axios from 'axios';
import React from "react";
import { Chip, NumericInput } from "susam-components/advanced";
import { Button, Checkbox, Notify, TextInput, TextArea } from "susam-components/basic";

export class Configuration extends React.Component {

    VALUE_FIELDS = {
        TEXT: {
            component: () => <TextInput />
        },
        NUMBER: {
            component: () => <NumericInput />
        },
        BOOLEAN: {
            component: () => <Checkbox />
        },
        LIST: {
            component: () => <Chip options={this.state.dataSource} valueField="code" />
        },
        LOOKUP: {
            component: () => <Chip options={this.state.dataSource} />
        },
        RULE: {
            component: () => <TextArea autosizeOnFocus={true} rows="1"/>
        }
    };

    state = {
        dataSource: [],
    };

    componentDidMount() {
        let { key, value,id } = this.props.configuration;
        if ('LOOKUP' === _.get(key, 'valueType.code')) {
            axios.get(key.dataSource).then(response => {
                this.setState({ dataSource: response.data })
            }).catch(error => Notify.showError(error))
        } else if ('LIST' === _.get(key, 'valueType.code')) {
            this.setState({ dataSource: key.dataSource })
        }
        this.setState({disabled: _.isNil(id)});
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props.configuration.id, prevProps.configuration.id)) {
            this.setState({ disabled: _.isNil(this.props.configuration.id) });
        }
    }

    handleChange(value) {
        if (this.props.onchange) {
            let configuration = _.cloneDeep(this.props.configuration);
            configuration.value = value;
            this.props.onchange(configuration);
        }
    }

    handleDelete() {
        Notify.confirm("Subsidiary customization will be deleted. Are you sure?", () => this.props.onDelete(this.props.configuration.id));
    }

    renderValueField() {
        let props = {
            label: this.props.configuration.key.name,
            value: this.props.configuration.value,
            onchange: value => this.handleChange(value)
        }
        let field = this.VALUE_FIELDS[this.props.configuration.key.valueType.code];
        return field && (<div>
            <div style={{float: "left", width: `${this.props.onDelete?'90':'100'}%`}}>
                {React.cloneElement(field.component(), props)}
            </div>
                {this.props.onDelete &&
                <div style={{float: "left", width: "10%"}}>
                    <Button mdIcon="delete_outline" flat={true} style="danger"
                        tooltip="Use Default Value" 
                        iconColorClass={!this.state.disabled && "uk-text-danger"} 
                        disabled={this.state.disabled}
                        onclick={()=>this.handleDelete()} />
                </div>}
        </div>
        )
    }

    render() {
        return this.renderValueField();
    }
}