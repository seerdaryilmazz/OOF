import React from 'react';
import * as axios from 'axios';

import {Modal, Card, Grid, GridCell} from 'susam-components/layout';
import {AutoComplete} from 'susam-components/advanced';
import {Button} from 'susam-components/basic';

export class NodeDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {

    }

    loadProject() {

    }


    handleClose() {
        this.modal.close();
    }

    show(projectCode) {
        if (!projectCode) {
            return;
        }

        this.modal.open();

        axios.get("/order-template-service/template-node/project/" + projectCode)
            .then((data) => {
                if (data.data) {
                    this.setState({data: data.data});
                }
            }).catch(function (err) {
            UIkit.notify("An Error Occured while Loading Project Details from Server. ");
            console.log("Error:" + err);
        });
    }

    prepareProjectElem(data) {

        if (!data) return null;

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    {data.description}
                </GridCell>
                <GridCell width="1-1">
                </GridCell>
                <GridCell width="1-1">
                    {this.retrieveRelationsElem(data)}
                </GridCell>
                <GridCell width="1-1">
                    {this.prepareParentElem(data)}
                </GridCell>

            </Grid>
        );
    }

    prepareParentElem(data) {

        if(!data || !data.parentOrderTemplate) return null;

        let parent = data.parentOrderTemplate

        return (
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        {this.prepareParentElem(parent)}
                    </GridCell>
                    <GridCell width="1-1">
                        <span>
                            <a href="#"
                               onClick={(event) => {event.preventDefault(); this.props.handleCriteriaClick(parent.code, "OrderTemplate")}}>{parent.name}</a>
                        </span>
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        {this.retrieveRelationsElem(parent)}
                    </GridCell>
                </Grid>
            </div>
        );

    }

    retrieveRelationsElem(data) {

        if(!data || !data.relations) {
            return null;
        }

        return <Grid>
            {
                data.relations.map(s => {
                    return (
                        <GridCell key={s.id} width="1-1" noMargin={true}>
                           <span class>
                               {s.label + ": "}<a href="#"
                                                  onClick={(event) => {event.preventDefault(); this.props.handleCriteriaClick(s.code, s.type)}}>{s.name}</a>
                           </span>
                        </GridCell>
                    );
                })
            }
        </Grid>
    }

    render() {

        let data = this.state.data;

        let projectName = "";

        if(data) {
            projectName = data.name;
        }

        return (
            <Modal title={projectName} ref={(c) => this.modal = c} large={true}
                   actions={[{label:"Close", action:() => this.handleClose()}, {label:"Criterias", action:() => this.props.handleCriteriaClick(data.code, "OrderTemplate")}]}>
                {this.prepareProjectElem(data)}
            </Modal>
        );
    }
}
