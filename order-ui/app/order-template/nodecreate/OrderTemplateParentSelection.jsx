import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, CardSubHeader} from 'susam-components/layout'
import {Button, TextInput, DropDown} from 'susam-components/basic';


export class OrderTemplateParentSelection extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
        if (this.props.data) {
            this.state.data = this.props.data;
        }
    };


    componentDidMount() {

        if (this.props.data) {
            this.state.data = this.props.data;
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState({data: nextProps.data});
        }
    }


    render() {

        if (!this.state.data) {
            return null;
        }

        console.log(JSON.stringify(this.state.data));
        return (
            <div>
                {
                    this.state.data.map(t => {
                        return (
                            <Card>

                                <Grid noMargin={true}>
                                    <GridCell noMargin={true} width="3-4">
                                        <Grid>
                                            <GridCell noMargin={true} width="2-4">NAME: {t.name}</GridCell>
                                            <GridCell width="1-1">DESC: {t.description}</GridCell>
                                        </Grid>
                                    </GridCell>
                                    <GridCell noMargin={true} width="1-4">
                                        <Grid noMargin={true}>
                                            <GridCell width="1-1">

                                                <Button label="Edit" flat={true} 
                                                        onclick={() => this.props.templateEditHandler(t)}/>
                                            </GridCell>
                                            <GridCell  width="1-1">

                                                <Button label="Use" style="primary" waves={true}
                                                        onclick={() => this.props.useParentCreateTemplateHandler(t)}/>
                                            </GridCell>

                                        </Grid>
                                    </GridCell>
                                </Grid>
                            </Card>
                        );

                    })
                }
            </div>
        );
    }
}

OrderTemplateParentSelection.contextTypes = {
    translator: React.PropTypes.object
};