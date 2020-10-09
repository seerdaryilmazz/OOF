import React from 'react';

import {Card, Grid, GridCell} from 'susam-components/layout';
import {AutoComplete} from 'susam-components/advanced';
import {Button} from 'susam-components/basic';

export class FindNodeNodeList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {
        this.state.selectedNodes = this.props.data;
    }

    componentWillReceiveProps(nextProps) {

        this.state.selectedNodes = nextProps.data;
        this.setState(this.state);
    }

    render() {

        if (!this.state.selectedNodes) {
            return null;
        }

        return (
            <Grid>
                {
                    this.state.selectedNodes.map(s => {
                        return (
                            <GridCell key={s.id} width="1-1">
                                {s.name } <i onClick={(e) => this.props.deleteNodeHandler(s.id)} className="uk-icon-small uk-icon-close"></i>
                            </GridCell>
                        );
                    })
                }
            </Grid>
        );
    }
}
