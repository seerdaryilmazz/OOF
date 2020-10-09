import React from 'react';

import {Card, Grid, GridCell} from 'susam-components/layout';
import {AutoComplete} from 'susam-components/advanced';
import {Button} from 'susam-components/basic';

import {NodeDetails} from "./NodeDetails.jsx";

export class FindNodeTemplateList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {
        this.state.templates = this.props.data;
    }

    componentWillReceiveProps(nextProps) {

        this.state.templates = nextProps.data;
        this.setState(this.state);
    }

    criteriaClicked(code, type) {
        window.open("/ui/order/order-template?code=" + code + "&type="+ type, "_blank");
    }

    detailsClicked(data) {
        this.setState({selectedProject: data});
        this.nodeDetails.show(data.code);
    }

    retrieveExtendHierarchy(orderTemplate) {

        if (!orderTemplate.parentOrderTemplate) {
            return null;
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}><span className="uk-text-bold">Hierarchy</span></GridCell>
                <GridCell width="1-1" noMargin={true}>
                    {this.retrieveHierarchyRecursively(orderTemplate.parentOrderTemplate)}
                </GridCell>
            </Grid>

        );

    }

    retrieveHierarchyRecursively(orderTemplate) {

        let result = [];

        if (orderTemplate.parentOrderTemplate) {
            this.retrieveHierarchyRecursively(orderTemplate.parentOrderTemplate).forEach(e => {
                result.push(e);
            });
            result.push("   ->   ");
        }

        result.push(<span key={orderTemplate.code}
                          title={orderTemplate.description}>
                            <a href="#"
                               onClick={(event) => {event.preventDefault(); this.detailsClicked(orderTemplate)}}>{orderTemplate.name}</a>
                        </span>);

        return result;

    }

    render() {

        if (!this.state.templates) {
            return null;
        }

        return (
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        {
                            this.state.templates.map(t => {
                                return (
                                    <Card key={t.code} className="uk-margin-small-top">
                                        <Grid >
                                            <GridCell width="4-5" noMargin={true}>
                                                <Grid>
                                                    <GridCell width="1-1" noMargin={true}>
                                                        <b>
                                                            <a href="#" onClick={(event) => {event.preventDefault(); this.detailsClicked(t)}}>{t.name}</a>
                                                        </b>
                                                    </GridCell>
                                                    <GridCell width="1-1" noMargin={true}><span className="uk-text-muted">{t.description}</span></GridCell>
                                                    <GridCell width="1-1">
                                                    </GridCell>
                                                    {this.retrieveExtendHierarchy(t)}
                                                </Grid>
                                            </GridCell>
                                        </Grid>
                                    </Card>
                                );
                            })
                        }
                    </GridCell>
                </Grid>
                <NodeDetails ref={(c) => this.nodeDetails = c}
                             handleCriteriaClick={(code, type) => this.criteriaClicked(code, type)}/>
            </div>
        );
    }
}
