import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { FabToolbar } from 'susam-components/advanced';
import { Button, Notify } from "susam-components/basic";
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { CrmLeadService, OutlookService } from '../services';
import { LoadingIndicator } from "../utils";
import { Lead } from "./Lead";

export class LeadManagement extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = { lead: {} };
    }

    componentDidMount() {
        this.initialize();
    }

    initialize() {
        this.setState({ busy: true });

        this.retrieveLeadInfo(this.props.params.leadId);

    }

    retrieveLeadInfo(leadId) {
        CrmLeadService.getLeadById(leadId).then(response => {
            this.setState({
                lead: response.data,
                readOnly: true,
                busy:false
            });
        }).catch(error => {
            this.setState({ busy: false });
            console.log(error);
            Notify.showError(error);
        });
    }



    handleStatusChange(status, confirmMsg) {
        if (this.state.lead.result != null) {

            Notify.confirm(_.defaultTo(confirmMsg, 'Are you sure?'), () => {
                CrmLeadService.updateStatus(this.state.lead.id, status).then(response => {
                    this.setState({lead: response.data});
                }).catch(e => Notify.showError(e));
            })
        }
        else {
            Notify.showError("Result value should be entered to move the lead status to Completed!");
        }
    }

    handleLeadSave() {
        this.saveLead();

    }

    updateState(key, value) {
        let state = _.cloneDeep(this.state);
        _.set(state, key, value)
        this.setState(state);
    }



    getOutlookLoginUrl() {
        let height = 640;
        let width = 800;
        let left = (window.innerWidth - width) / 2;
        let top = (window.innerHeight - height) / 2;
        let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${width},height=${height},left=${left},top=${top}`;
        OutlookService.getLoginUrl().then(response => {
            window.open(response.data, '_blank', params);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    saveLead() {
        this.createOrUpdateLead(true);

    }

    createOrUpdateLead(complete) {
        this.setState({ busy: true });
        let lead = _.cloneDeep(this.state.lead);


        let call = null;
        if (lead.id) {
            call = () => CrmLeadService.updateLead(lead.id, lead);
        } else {
            call = () => CrmLeadService.createLead(lead);
        }
        call().then(response => {
            this.setState({
                lead: response.data,
                readOnly: true,
                busy: false
            }, () => {
                Notify.showSuccess("Lead saved successfully");
                this.context.router.push("/ui/crm/lead/view/" + this.state.lead.id);
            });
        }).catch(error => {
            this.setState({ busy: false });
            Notify.showError(error);
        });
    }

    renderButtons() {
        if (!this.state.readOnly) {
            return (
                <GridCell>
                    <div className="uk-align-right">
                        <Button label="Save" style="success"
                            onclick={() => this.handleLeadSave()} />
                        <Button label="Cancel" style="danger"
                            onclick={() => this.setState({ readOnly: true }, () => this.retrieveLeadInfo(this.props.params.leadId))} />
                    </div>
                </GridCell>
            );
        }
    }


    renderActionMenu() {
        let actions = [];

        let lead = this.state.lead;
        if (this.state.readOnly
            && _.get(lead, 'status.code') != 'CANCELED'
            && this.state.lead.id) {
            if (_.get(lead, 'status.code') == 'OPEN') {
                actions.push({
                    name: "Edit Lead",
                    icon: "edit",
                    onAction: () => this.setState({ readOnly: false }),
                   
                });

                actions.push({
                    name: "Complete Lead",
                    icon: "check_circle_outline",
                    onAction: () => this.handleStatusChange("COMPLETED", 'Lead will be completed. Are you sure?'),});

            } else {
                actions.push({
                    name: "Reopen Lead",
                    icon: "restore",
                    onAction: () => this.handleStatusChange("OPEN", 'Lead will be reopened. Are you sure?'),
                    
                });
            }
        }
        if (!_.isEmpty(actions)) {
            return (
                <div className="user_heading" style={{ padding: "0" }}>
                    <FabToolbar actions = {actions}/>
                </div>
            );
        }
    }


    render() {
        let leadNumberSuffix = !_.isNil(this.state.lead.number) ? " - " + this.state.lead.number : "";
        let leadStyle = { minHeight: "900px" };

        return (
            <div>
                <LoadingIndicator busy={this.state.busy} />
                <PageHeader title={super.translate("Lead") + leadNumberSuffix}/>
                <Grid divider={true} noMargin={true}>
                    <GridCell width="1-1">
                        <Grid collapse={true}>
                            <GridCell width="1-1">
                                <Card>
                                    <Grid collapse={true}>
                                        <GridCell width="1-1">
                                            {this.renderActionMenu()}

                                                <Lead ref={c => this.leadForm = c}
                                                    lead={this.state.lead}
                                                    users={this.state.users}
                                                    readOnly={this.state.readOnly}
                                                    onChange={(value) => this.updateState("lead", value)} />
                                        </GridCell>

                                        {this.renderButtons()}
                                    </Grid>
                                </Card>
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}

LeadManagement.contextTypes = {
    user: React.PropTypes.object,
    router: React.PropTypes.object
};

