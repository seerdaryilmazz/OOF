import PropTypes from 'prop-types';
import React from 'react';
import { ReadOnlyDropDown } from 'susam-components/basic';
import { AuthorizationService } from '../services';

export class Subsidiary extends React.Component {

    static contextTypes = {
        user: PropTypes.object,
        operations: PropTypes.array
    }

    state = {
        subsidiaries: []
    };

    constructor(props) {
        super(props);
    }
    componentDidMount(){
        this.listSubsidiaries();
    }

    listSubsidiaries() {
        let { value } = this.props;
        AuthorizationService.listSubsidiaries().then(response => {
            let subsidiaries = response.data;
            if(!_.find(this.context.operations, i=>_.isEqual(i, "pricing.tariff-manage"))){
                subsidiaries = _.filter(response.data, i=>_.find(this.context.user.subsidiaries, k=>k.id === i.id));
            }
            this.setState({ subsidiaries: subsidiaries })
            let val = null;
            if (!_.isEmpty(this.context.user.subsidiaries)) {
                let subsidiary = value || this.context.user.firstSubsidiary
                val = _.find(subsidiaries, i => i.id === subsidiary.id);
            } else if (1 === this.state.subsidiaries.length) {
                val = _.first(subsidiaries);
            }
            this.handleSubsidiaryChange(val)
        })
    }

    handleSubsidiaryChange(value){
        this.props.onchange && this.props.onchange(value);
    }

    render() {
        return <ReadOnlyDropDown {...this.props}
            label={this.props.label || 'Subsidiary'}
            readOnly={1 === _.get(this.state, 'subsidiaries', []).length}
            options={this.state.subsidiaries}
            value={this.props.value}
            onchange={value => this.handleSubsidiaryChange(value)} />
    }

}