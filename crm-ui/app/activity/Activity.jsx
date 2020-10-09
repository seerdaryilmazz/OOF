import * as axios from "axios";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from "susam-components/advanced";
import { DropDown, Form, Notify, Span } from "susam-components/basic";
import { Grid, GridCell } from 'susam-components/layout';
import { LookupService } from '../services';
import { withReadOnly } from "../utils";


const statusStyles = {
    COMPLETED: "success",
    OPEN: "primary",
    CANCELLED: "muted",
    CANCELED: "muted"
}
export class Activity extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {};
    }

    componentDidMount() {
        this.initializeLookups();
    }

    componentDidUpdate(prevProps){
        if(!_.isEqual(prevProps.activity.tool, this.props.activity.tool)){
            if(!_.isEmpty(this.props.activity.tool) && this.props.activity.tool.code == "MEETING"){
                LookupService.getActivityTypesByTool("MEETING").then(response => [
                    this.setState({activityTypes: response.data})
                ]).catch(error => {
                    console.log(error);
                    Notify.showError(error);
                });
            }
        }
    }

    initializeLookups() {
        axios.all([
            LookupService.getServiceAreas(),
            LookupService.getActivityScopes(),
            LookupService.getActivityTools(),
            LookupService.getActivityTypesByTool(),
        ]).then(axios.spread((segmentTypes, activityScopes, activityTools, activityTypes) => {
            let state = _.cloneDeep(this.state);
            state.segmentTypes = segmentTypes.data;
            state.activityScopes = activityScopes.data;
            state.activityTools = activityTools.data;
            state.activityTypes = activityTypes.data;
            this.setState(state);
            if(!this.props.activity.id){
                this.handleChange("scope", _.find(activityScopes.data, i=> i.code === "EXTERNAL"));
            }
        })).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    handleChange(key, value) {
        let activity = _.cloneDeep(this.props.activity);
        if(key === 'tool'){
            LookupService.getActivityTypesByTool(_.get(value, 'code')).then(response=>{
                this.setState({activityTypes: response.data});
            });
            activity['type'] = null;
        }
        activity[key] = value;
        this.props.onChange(activity);
    }


    renderCreatedDate() {

        let format = "DD.MM.YYYY HH:mm";
        if (this.props.activity.createdAt) {
            return this.moment(this.props.activity.createdAt, "DD.MM.YYYY HH:mm").format(format);
        } else if (this.props.activity.createdAt == null && this.props.activity.id != null) {
            return '';
        } else {
            return this.moment().format(format);
        }
    }

    renderStatus() {
        let code = _.get(this.props.activity, 'status.code');
        let name = _.get(this.props.activity, 'status.name');
        return <span className={`uk-badge uk-badge-${statusStyles[code]}`} style = {{fontSize:"15px"}}>{this.translate(name)}</span>
    }

    getUserNames(username){
        return _.get(_.find(this.context.getUsers(), i=>i.username==username),'displayName');
    }

    render() {
        if (!(this.props.activity && this.props.activity.account)) {
            return null;
        }
        return (
            <Form ref={c => this.form = c}>
                <Grid>
                    <GridCell width="1-1">
                        <Grid>
                            <GridCell width="1-2">
                                <Span label="Status" value={this.renderStatus()} />
                            </GridCell>
                            <GridCell width="1-2">
                                <Span label="Related Account" value={<a style={{ color: 'black' }} href={`/ui/crm/account/${this.props.activity.account.id}/view`}><u>{this.props.activity.account.name}</u></a>} />
                            </GridCell>
                            <GridCell width="1-2">
                                <Span label="Created By / Created Date" value={this.getUserNames(this.props.activity.createdBy) + " / " + this.renderCreatedDate()} />
                            </GridCell>
                            <GridCell width="1-2">
                                <ReadOnlyChip options={this.state.segmentTypes} label="Service Area"
                                    valueField="code" required={true} hideSelectAll={true}
                                    translate={true}
                                    value={this.props.activity.serviceAreas}
                                    readOnly={this.props.readOnly}
                                    onchange={(data) => this.handleChange("serviceAreas", data)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <ReadOnlyDropDown options={this.state.activityScopes} label="Scope" required={true}
                                    valueField="code"
                                    translate={true}
                                    value={this.props.activity.scope}
                                    readOnly={this.props.readOnly}
                                    onchange={(data) => this.handleChange("scope", data)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <ReadOnlyDropDown options={this.state.activityTools} label="Tool" required={true}
                                    valueField="code"
                                    translate={true}
                                    value={this.props.activity.tool}
                                    readOnly={this.props.readOnly}
                                    onchange={(data) => this.handleChange("tool", data)} />
                            </GridCell>
                            <GridCell width="1-2">
                                <ReadOnlyDropDown options={this.state.activityTypes} label="Type" required={true}
                                    valueField="code" labelField="name"
                                    translate={true}
                                    value={this.props.activity.type}  
                                    readOnly={this.props.readOnly}
                                    onchange={(data) => this.handleChange("type", data)} />
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
            </Form>
        );

    }
}
const ReadOnlyChip = withReadOnly(Chip);
const ReadOnlyDropDown = withReadOnly(DropDown);

Activity.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
}