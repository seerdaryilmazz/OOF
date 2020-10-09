import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { DropDown, Notify } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { AuthorizationService } from '../../services';

export class RemoveRelation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            cancelOperations: []
        }
    }

    componentDidMount() {
        this.loadGraph();
    }

    loadGraph() {
        AuthorizationService.getGraph(this.props.team, { depth: 1, direction: "OUTCOMING" }).then(response => {
            let nodes = response.data.nodes;
            let options = _.reject(nodes, (node) => _.isEqual(node.id, this.props.team.id)).map(i => {
                return {
                    id: i.id,
                    name: i.type + ": " + i.name
                }
            });
            this.setState({ nodes: nodes, options: options });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleChange(value) {
        let node = _.find(this.state.nodes, { id: value.id });
        this.setState({ value: value });
        this.props.onValueChange && this.props.onValueChange(this.props.team, node);

        this.getAuthorizedOperations(value);
    }

    getAuthorizedOperations(selectedOption) {
        let reqs = _.reject(this.state.options, selectedOption).map(opt => AuthorizationService.getInheritedAuthorizedOperations(opt.id));
        reqs.unshift(AuthorizationService.getAuthorizedOperations(this.props.team.id));
        axios.all(reqs).then(responses => {
            let result = []
            responses.forEach(i => {
                result = _.union(result, i.data);
            });
            AuthorizationService.getInheritedAuthorizedOperations(selectedOption.id).then(response => {
                let cancelOperations = _.differenceBy(response.data, result, "id");
                this.setState({ "cancelOperations": cancelOperations });
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    renderAlert() {
        if (_.isEmpty(this.state.cancelOperations)) {
            return null;
        } else {
            return (
                <GridCell>
                    <div className="uk-alert uk-alert-danger" data-uk-alert="">
                        After this change, following operation authorizations will be cancelled for the team and teams which are inherited from chosen one.
                        <ul>
                            {this.state.cancelOperations.map(i => <li key={i.id}>{i.name}</li>)}
                        </ul>
                    </div>
                </GridCell>
            );
        }
    }

    render() {
        return (
            <Grid>
                <GridCell>
                    <DropDown
                        options={this.state.options}
                        value={this.state.value}
                        onchange={(value) => this.handleChange(value)}
                    />
                </GridCell>
                {this.renderAlert()}
            </Grid>
        );
    }
}