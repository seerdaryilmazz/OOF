import React from 'react';
import * as axios from 'axios';

import {Modal, Card, Grid, GridCell} from 'susam-components/layout';
import {AutoComplete} from 'susam-components/advanced';
import {Button} from 'susam-components/basic';

export class ApprovalModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {dataDifference: []};

    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    handleClose() {
        this.modal.close();
    }

    show(updatedData, data) {

        this.setState({updatedData: updatedData});
        axios.post("/order-template-service/order-template/affectedProjects", data).then((res) => {
            if(!res.data) return;
            this.setState({affectedprojectcodes: res.data.codes});
            this.setState({hierarchy: res.data.hierarchy});
        }).catch(function (err) {
            UIkit.notify("An Error Occured while retrieving projects being affected by the data change. ");
            console.log("Error:" + err);
        });

        this.modal.open();

    }

    retrieveIcon(data) {
        let icon = <i className="uk-icon-sm uk-icon-circle-o"></i>
        
        if(this.state.affectedprojectcodes.indexOf(data.code) > -1) {
            icon = <i className="uk-icon-sm uk-icon-circle"></i>
        }

        return icon;
    }

    handleLinkClick(data) {
        window.open("/ui/order/order-template?code=" + data.code + "&type=OrderTemplate", "_blank");

    }

    retrieveHierarchyContent(data) {

        if (!data || !this.state.affectedprojectcodes) return null;

        return (

            <ul className="md-list md-list-addon">
                {data.map(d => {
                    return (
                        <li key={d.code} style={{marginLeft: "24px", minHeight: "24px"}}>
                            <div className="md-list-addon-element" style = {{left: "-24px", width: "24px"}}>
                                {this.retrieveIcon(d)}
                            </div>
                            <div className="md-list-content">
                                <span className="uk-text-truncate">
                                    <a href="#"
                                       onClick={(event) => {event.preventDefault(); this.handleLinkClick(d)}}>{d.name}</a>
                                </span>
                                <div>
                                    {this.retrieveHierarchyContent(d.childrenOrderTemplates)}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }


    prepareContent () {

        return (
            <Grid>
                <GridCell width="1-1">
                    {this.retrieveHierarchyContent(this.state.hierarchy)}
                </GridCell>
            </Grid>);
    }


    render() {

        let data = this.state.dataDifference;

        let title = this.props.title + " - Approval";

        return (
            <Modal title={title} ref={(c) => this.modal = c} large={true}
                   actions={[{label:"Close", action:() => this.handleClose()}, {label:"Save", action:() => this.props.saveHandler()}]}>
                {this.prepareContent()}
            </Modal>
        );
    }
}
