import React from 'react';

import {Card, Grid, GridCell} from 'susam-components/layout';
import {AutoComplete} from 'susam-components/advanced';
import {Button} from 'susam-components/basic';

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
    
    retrieveExtendHierarchy(orderTemplate) {

        if (!orderTemplate.parentOrderTemplate) {
            return null;
        }

        return (
            <Grid>
                <GridCell width="1-1"><span className="uk-text-bold">Hierarchy</span></GridCell>
                <GridCell width="1-1"noMargin={true}>
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
                          title={orderTemplate.description}>{orderTemplate.name}</span>);

        return result;

    }

    retrieveTemplateSelectHandler(template) {


        if (!this.props.templateSelectHandler) {
            return null;
        }
        return (
            <Button label="USE" style="primary" waves={true}
                    onclick={() => this.props.templateSelectHandler(template)}/>
        );
    }

    render() {

        if (!this.state.templates) {
            return null;
        }

        return (

            <Grid>
                <GridCell width="1-1">
                    {
                        this.state.templates.map(t => {
                            return (
                                <Card key={t.code} className="uk-margin-small-top">
                                    <Grid>
                                        <GridCell width="9-10" noMargin={true}>
                                            <Grid>
                                                <GridCell width="2-4" noMargin={true}><span
                                                    className="uk-text-bold">{t.name}</span></GridCell><GridCell
                                                width="2-4"/>
                                                <GridCell width="1-1" noMargin={true}><span
                                                    className="uk-text-muted">{t.description}</span></GridCell>
                                                {this.retrieveExtendHierarchy(t)}
                                            </Grid>
                                        </GridCell>
                                        <GridCell width="1-10" noMargin={true}  >
                                            {this.retrieveTemplateSelectHandler(t)}
                                        </GridCell>
                                    </Grid>
                                </Card>
                            );
                        })
                    }
                </GridCell>
            </Grid>
        );
    }
}
