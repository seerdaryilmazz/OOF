import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { FabToolbar } from 'susam-components/advanced';
import { Form, Notify, ReadOnlyDropDown, Span, TextArea } from "susam-components/basic";
import { Grid, GridCell } from 'susam-components/layout';
import { CrmLeadService } from '../services';


const statusStyles = {
    COMPLETED: "success",
    OPEN: "primary",
    CANCELLED: "muted",
    CANCELED: "muted"
}
export class Lead extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            lead:{},
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({lead: nextProps.lead});
    }

    updateLead(fieldName, value) {
        let lead = _.cloneDeep(this.state.lead);
        lead[fieldName] = value;
        this.setState({lead: lead});
    }

    save() {
        if (this.form.validate()) {
            if (this.state.lead.id) {
                this.editLead(this.state.lead);
            } else {
                this.addLead(this.state.lead);
            }
        }
    }

    addLead(lead) {
        CrmLeadService.add(lead).then(response => {
            Notify.showSuccess("Lead added");
            this.props.onchange();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    editLead(lead){
        CrmLeadService.edit(lead).then(response => {
            Notify.showSuccess("Lead edited");
            this.props.onchange();
        }).catch(error => {
            Notify.showError(error);
        });


    }

    handleChange(key, value) {
       

        let lead = _.cloneDeep(this.props.lead);
        lead[key] = value;
        this.props.onChange(lead);
    }

    handleUserChange(key, value) {


        let lead = _.cloneDeep(this.props.lead);
        lead[key] = value;
        this.props.onChange(lead);
    }


    renderCreatedDate() {

        let format = "DD.MM.YYYY HH:mm";
        if (this.props.lead.createdAt) {
            return this.moment(this.props.lead.createdAt, "DD.MM.YYYY HH:mm").format(format);
        } else if (this.props.lead.createdAt == null && this.props.lead.id != null) {
            return '';
        } else {
            return this.moment().format(format);
        }
    }

    renderActionMenu(){

        if(this.props.lead.id){
            let actions = [];

            let editLead = null;
            if (this.props.lead.responsibleUser !== this.context.user.username) {
                editLead = ["crm-lead.power-update"];
            } else {
                editLead = ["crm-lead.update"];
            }

            actions.push({name:"Edit Lead", icon: "edit", onAction: () => this.setState({ readOnly: false }), operationName: editLead});
            actions.push({name: "Complete Lead", icon: "check_circle_outline", onAction: () => this.handleStatusChange("COMPLETED", 'Lead will be completed. Are you sure?'),});

            return(

                <div className="user_heading" style = {{padding: "0 0 0 0",top:"-20px"}}>
                    <FabToolbar actions = {actions} />
                </div>
            );
        }
    }

    renderStatus() {
        let code = _.get(this.props.lead, 'status.code');
        let name = _.get(this.props.lead, 'status.name');
        return <span className={`uk-badge uk-badge-${statusStyles[code]}`} style = {{fontSize:"15px"}}>{this.translate(name)}</span>
    }

    getUserNames(username){
        return _.get(_.find(this.state.userList, i=>i.username==username),'displayName');
    }

    render() {
        if (!(this.props.lead)) {
            return null;
        }
        return (
            <Form ref={c => this.form = c}>
                <Grid>
                    <GridCell width="1-1">
                        <Grid>
                            <GridCell width="1-3">
                                <Span label="Status" value={this.renderStatus()} />
                            </GridCell>

                            <GridCell width="1-3" noMargin={true}>
                                {
                                    this.props.readOnly
                                        ? <Span label="Responsible" value = {_.get(this.props.lead, 'responsibleUser.displayName')}/>
                                        : <ReadOnlyDropDown options={this.context.getUsers()} label="Responsible" labelField = "displayName"
                                                            valueField="username" required={true} readOnly={this.props.readOnly}
                                                            value={this.props.lead.responsibleUser}
                                                            onchange = {(responsibleUser) => {responsibleUser ? this.handleUserChange("responsibleUser", responsibleUser) : null}}/>
                                }
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Service Area" value= {_.get(this.props.lead, 'serviceArea.name')}/>
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Sector" value= {_.get(this.props.lead, 'sector.name')}/>
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Name" value = {this.props.lead.name} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Surname" value = {this.props.lead.surname} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Company Name" value = {this.props.lead.companyName} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Email" value = {this.props.lead.email} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Phone" value = {"("+_.get(this.props.lead, 'phoneNumber.countryCode')+")"+ _.get(this.props.lead, 'phoneNumber.phone')} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="" />
                            </GridCell>
                            <GridCell width="1-1">
                                <Span label="Demand" value = {this.props.lead.demand || " "}/>
                            </GridCell>
                            <GridCell width="1-1">
                                <TextArea label="Result" value = {this.props.lead.result || " "}
                                                  rows={3}  maxLength="2000" readOnly={this.props.readOnly}
                                                  onchange = {(value) => this.handleChange("result", value)}/>
                            </GridCell>

                            <GridCell width="1-1">
                                <Span label="" />
                            </GridCell>



                        </Grid>
                    </GridCell>
                </Grid>
            </Form>
        );

    }
}

Lead.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
}