import React from 'react';
import { Button } from 'susam-components/basic/Button';
import { TextInput } from 'susam-components/basic/TextInput';

export class CustomerGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state={companies: []};
    }
    componentDidMount() {
        this.setState({companies: this.props.customerGroup.companies});
    }

    componentDidUpdate(prevProps, prevState) {
        if(!_.isEqual(prevProps.customerGroup.companies, this.props.customerGroup.companies)){
            this.setState({companies: this.props.customerGroup.companies});
        }
    }

    onCompanyFilterChange(value) {
        let companies = this.props.customerGroup.companies
        if (!_.isEmpty(value)) {
            companies = _.filter(this.props.customerGroup.companies, i => i.name.includes(value.toLocaleUpperCase(navigator.language)));
        }
        this.setState({ companies: companies, companyFilter: value })
    }

    render() {
        let { customerGroup } = this.props;
        return (
            <div>
                <div style={{float:"right",position:"relative", top: "2px", marginRight:"24px", zIndex:"999", textAlign:"right"}}>
                    <Button style="danger" flat={true} label="Remove" size="small" onclick={() => this.props.onDelete && this.props.onDelete(customerGroup, this.props.index)} />
                    <Button style="success" flat={true} label="Edit Portfolio" size="small" onclick={() => this.props.onEdit && this.props.onEdit(customerGroup, this.props.index)} />
                </div>
                <div className="uk-accordion-title" style={{height:"16px"}}>
                    <h5 style={{ marginTop: "-2px" }}>{customerGroup.name}</h5>
                </div>
                <div className="uk-accordion-content" style={{ overflow: "auto", maxHeight: "20vh" }}>
                    <TextInput value={this.state.companyFilter} onchange={(value) => this.onCompanyFilterChange(value)} placeholder="Filter Company..." />
                    <i className="uk-icon-search" style={{ float: "right", position: "relative", top: "-24px", right: "8px", zIndex: "999" }} />
                    <ul className="md-list">
                        {this.state.companies.map(i => <li key={i.id}>{i.name}</li>)}
                    </ul>
                </div>
            </div>
        );
    }
}