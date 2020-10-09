import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, CardSubHeader} from 'susam-components/layout'
import {GeneralInfo} from './GeneralInfo';
import {Button, TextInput} from 'susam-components/basic';
import {PageHeader} from 'susam-components/layout';
import {OrderQuota} from './OrderQuota';
import {ShipmentInfo} from './ShipmentInfo';
import {RouteRequirements} from './RouteRequirements';
import {VehicleRequirements} from './VehicleRequirements';
import {EquipmentRequirements} from './EquipmentRequirements';
import {ProjectService, ProjectNodeService} from '../../services';
import {ReadOnlyDataInterface} from '../../common/ReadOnlyDataInterface';
import {ApprovalModal} from './ApprovalModal.jsx';

export class OrderTemplatePage extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            hierarchialData: {},
            copyFromParentConfirmed: false,
            updatedData: {}
        };
    }

    componentDidMount() {
        let projectCode = this.props.location.query.code;
        let projectType = this.props.location.query.type;

        if (projectCode && projectType) {

            ProjectService.getProjectCriterias(projectCode, projectType).then((res) => {
                if (res.data) {
                    this.setState({data: res.data});
                }
                if (projectType == "OrderTemplate") {
                    ProjectService.getProjectDetailsHierarchy(projectCode, projectType).then((hierarchialDetailsData) => {
                        if (hierarchialDetailsData.data) {
                            this.setState({hierarchialData: hierarchialDetailsData.data});
                        }
                    }).catch(function (err) {
                        UIkit.notify("An Error Occured while Loading Project Details from Server. ");
                        console.log("Error:" + err);
                    });
                }
            }).catch(function (err) {
                UIkit.notify("An Error Occured while Loading Project from Server. ");
                console.log("Error:" + err);
            });



        } else {
            Notify.showError("Project can not be loaded due to missing parameters");
        }

    }

    updateDataWithNotification(field, value, message) {
        UIkit.notify(message);
        this.updateData(field, value);
    }

    updateData(field, value) {

        let data = this.state.data;

        if (value == null || (Array.isArray(value) && value.length == 0)) {
            data[field] = null;
        } else {
            data[field] = value;
        }

        this.setState({data: data});
    }

    saveClicked() {

        this.approvalModal.show(this.state.updatedData, this.state.data);

    }

    save() {
        let self = this;
        ProjectService.saveProjectCriteria(this.state.data)
            .then((res) => {
                this.reloadPage();
                UIkit.notify("Project Edit Successfull ");
            })
            .catch(function (err) {
                UIkit.notify("An Error Occured while saving Project. ");
                console.log("Error:" + err);
            });

    }

    reloadPage(data) {
        window.location.reload();
    }

    handleCopyCriteriaFromParent(field, data) {

        let self = this;
        if (this.state.copyFromParentConfirmed) {
            this.updateDataWithNotification(field, data.data, "Data was copied from '" + data.owner.label + "'");
        } else {
            UIkit.modal.confirm(" Please note that copying any criteria from Base Projects will make it specific for this project.</br>"
                + " Future updates of this criteria in the Base Project will not be reflected here. </br></br>"
                + " Do you confirm?", () => {
                    self.state.copyFromParentConfirmed = true;
                    this.updateDataWithNotification(field, data.data, "Data was copied from '" + data.owner.label + "'");
                }
            );
        }
    }

    retrieveHierarchyIcon(historyobjectToTextFcn, field) {

        if(this.state.data && this.state.data.readonlyFields && this.state.data.readonlyFields[field]) {
            return null;
        }

        let data = null;

        if(!this.state.hierarchialData.data){
            return null
        } else {
            data = this.state.hierarchialData.data[field];
        }

        if (!data || !data.owner) {
            return null;
        }

        let label = historyobjectToTextFcn(data);

        return (
            <a href="javascript:void(null);" onClick={() => {this.handleCopyCriteriaFromParent(field, data)}}>
                <i className="uk-icon-small uk-icon-info-circle" title={label}></i>
            </a>);
    }

    handlePageHeaderClick() {
        if (!this.state.headerEditMode) {
            this.setState({headerEditMode: true, headerName: this.state.data.name});
        }
    }

    retrievePageheader() {

        if(!this.state.headerEditMode) {

            let pageHeader = this.state.data.name;

            if(!pageHeader) {
                pageHeader = "<No Name>";
            }

            if(this.state.data.label) {
                pageHeader += " - " + this.state.data.label;
            }

            return <PageHeader title={pageHeader}/>
        } else {

            return (
              <Grid>
                  <GridCell width="2-3">
                      <TextInput value={this.state.headerName} onchange={(e) => this.setState({headerName: e})}/>
                      </GridCell>
                  <GridCell width="1-3">
                      <Button label="SAVE" style="primary" waves={true}
                              onclick={() => this.saveHeaderClicked()}/>
                  </GridCell>(
              </Grid>
            );
        }
    }

    saveHeaderClicked() {

        ProjectService.updateProjectName(this.state.data.code, this.state.headerName)
            .then((res) => {
                UIkit.notify("Project Name Change Successfull ");
                let data = _.cloneDeep(this.state.data);
                data.name = this.state.headerName;
                this.setState({headerEditMode: false, headerName: null, data: data });
            })
            .catch(function (err) {
                UIkit.notify("An Error Occured while changing Project Name. ");
                console.log("Error:" + err);
            });

    }


    render() {

        let readOnlyDataInterface = new ReadOnlyDataInterface(this.state.data, "readonlyFields");

        return (
            <div>
                <Grid>
                    <GridCell width="5-10">
                        <div onClick={() => this.handlePageHeaderClick()}>
                            {this.retrievePageheader()}
                        </div>
                    </GridCell>
                    <GridCell width="4-10">
                    </GridCell>
                    <GridCell width="1-10">
                        <div className="uk-float-right">
                                <Button label="SAVE" style="primary" waves={true}
                                        onclick={() => this.saveClicked()}/>
                        </div>
                    </GridCell>
                    <GridCell width="1-2">
                        <Grid >
                            <GridCell width="1-1" noMargin={true}>
                                <GeneralInfo data={this.state.data}
                                             readOnlyDataInterface={readOnlyDataInterface}
                                             hierarchialDataIcon={(fcn, field) => this.retrieveHierarchyIcon(fcn, field)}
                                             handleDataUpdate={(field, value) => this.updateData(field, value)}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <OrderQuota
                                    data={this.state.data}
                                    hierarchialDataIcon={(fcn, field) => this.retrieveHierarchyIcon(fcn, field)}
                                    handleDataUpdate={(field, value) => this.updateData(field, value)}></OrderQuota>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-2">
                        <ShipmentInfo data={this.state.data}
                                      readOnlyDataInterface={readOnlyDataInterface}
                                      hierarchialDataIcon={(fcn, field) => this.retrieveHierarchyIcon(fcn, field)}
                                      handleDataUpdate={(field, value) => this.updateData(field, value)}>

                        </ShipmentInfo>
                    </GridCell>
                    <GridCell width="1-2">
                        <RouteRequirements data={this.state.data}
                                           hierarchialDataIcon={(fcn, field) => this.retrieveHierarchyIcon(fcn, field)}
                                           handleDataUpdate={(field, value) => this.updateData(field, value)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <VehicleRequirements data={this.state.data}
                                           hierarchialDataIcon={(fcn, field) => this.retrieveHierarchyIcon(fcn, field)}
                                           handleDataUpdate={(field, value) => this.updateData(field, value)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <EquipmentRequirements data={this.state.data}
                                             hierarchialDataIcon={(fcn, field) => this.retrieveHierarchyIcon(fcn, field)}
                                             handleDataUpdate={(field, value) => this.updateData(field, value)}/>
                    </GridCell>
                </Grid>
                <ApprovalModal ref={(c) => this.approvalModal = c}
                               title={this.state.data.name}
                               saveHandler={() => this.save()}>

                </ApprovalModal>
            </div>
        );
    }
}

OrderTemplatePage.contextTypes = {
    translator: React.PropTypes.object
};
