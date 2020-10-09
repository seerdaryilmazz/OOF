import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Button, DropDown} from 'susam-components/basic';

import {Card, Grid, GridCell, CardHeader} from "susam-components/layout";


export class TruckLoadRuleElem extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {
            data: {},
            lookup: {},
            isHidden: false
        }
        this.APPROVAL_TYPE_POSIBLE_WITH_APPROVAL_ID = "POSSIBLE_WITH_APPROVAL";
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {

        let ctwThirdPartyRule = {};
        let dfwThirdPartyRule = {};
        let combinationAtXDockRule = {};
        let lookup = {};
        if (props.ctwThirdPartyRule) {
            ctwThirdPartyRule = props.ctwThirdPartyRule;
        }
        if (props.dfwThirdPartyRule) {
            dfwThirdPartyRule = props.dfwThirdPartyRule;
        }
        if (props.combinationAtXDockRule) {
            combinationAtXDockRule = props.combinationAtXDockRule;
        }
        if (props.lookup) {
            lookup = props.lookup;
        }
        this.setState({
            data: {
                ctwThirdPartyRule: ctwThirdPartyRule,
                dfwThirdPartyRule: dfwThirdPartyRule,
                combinationAtXDockRule: combinationAtXDockRule,
            },
            lookup: lookup
        });

    }


    handleSave() {
       this.props.saveHandler(this.state.data);
    }

    handleDataUpdate(rule, field, value) {

        if(value == "") {
            value = null;
        }
        
        let data = this.state.data[rule];

        if(!data) {
            data = {};
        }

        data.approvalWorkflow = null;

        data[field] = value;
        this.setState({[rule]: data})
    }

    handleShowHideClick() {
        if (this.state.isHidden) {
            this.setState({isHidden: false});
        } else {
            this.setState({isHidden: true});
        }
    }

    retrieveShowHideIcon() {
        if (this.state.isHidden) {
            return "angle-double-down";
        } else {
            return "angle-double-up";
        }
    }

    renderCTWThirdPartyRuleBody() {

        let ctwThirdPartyRule = this.state.data.ctwThirdPartyRule;
        let lookup = this.state.lookup;

        let approvalType = ctwThirdPartyRule ? ctwThirdPartyRule.approvalType : null;
        let approvalWorkflow = ctwThirdPartyRule ? ctwThirdPartyRule.approvalWorkflow : null;

        let approvalWorkflowElem = null;

        if(approvalType
            && approvalType.id == this.APPROVAL_TYPE_POSIBLE_WITH_APPROVAL_ID) {

            approvalWorkflowElem = <DropDown label="Approval Workflow" options={lookup.approvalWorkflow}
                                             value={approvalWorkflow}
                                             onclear={(value) => this.handleDataUpdate("ctwThirdPartyRule", "approvalWorkflow", null)}
                                             onchange={(value) => this.handleDataUpdate("ctwThirdPartyRule", "approvalWorkflow", value)}/>
        }

        return (
            <Grid>
                <GridCell width="1-4" noMargin={true}>
                    <DropDown label="Approval Type" options={lookup.approvalType}
                              value={approvalType}
                              onclear={(value) => this.handleDataUpdate("ctwThirdPartyRule", "approvalType", null)}
                              onchange={(value) => this.handleDataUpdate("ctwThirdPartyRule", "approvalType", value)}/>
                </GridCell>
                <GridCell width="1-4" noMargin={true}>
                    {approvalWorkflowElem}
                </GridCell>
                <GridCell width="1-2" noMargin={true}/>
            </Grid>
        )
    }
    renderDFWThirdPartyRuleBody() {

        let dfwThirdPartyRule = this.state.data.dfwThirdPartyRule;
        let lookup = this.state.lookup;

        let approvalType = dfwThirdPartyRule ? dfwThirdPartyRule.approvalType : null;
        let approvalWorkflow = dfwThirdPartyRule ? dfwThirdPartyRule.approvalWorkflow : null;

        let approvalWorkflowElem = null;

        if(approvalType
            && approvalType.id == this.APPROVAL_TYPE_POSIBLE_WITH_APPROVAL_ID) {

            approvalWorkflowElem = <DropDown label="Approval Workflow" options={lookup.approvalWorkflow}
                                             value={approvalWorkflow}
                                             onclear={(value) => this.handleDataUpdate("dfwThirdPartyRule", "approvalWorkflow", null)}
                                             onchange={(value) => this.handleDataUpdate("dfwThirdPartyRule", "approvalWorkflow", value)}/>
        }

        return (
            <Grid>
                <GridCell width="1-4" noMargin={true}>
                    <DropDown label="Approval Type" options={lookup.approvalType}
                              value={approvalType}
                              onclear={(value) => this.handleDataUpdate("dfwThirdPartyRule", "approvalType", null)}
                              onchange={(value) => this.handleDataUpdate("dfwThirdPartyRule", "approvalType", value)}/>
                </GridCell>
                <GridCell width="1-4" noMargin={true}>
                    {approvalWorkflowElem}
                </GridCell>
                <GridCell width="1-2" noMargin={true}/>
            </Grid>
        )
    }
    renderCombinationAtXDockRuleBody() {

        let combinationAtXDockRule = this.state.data.combinationAtXDockRule;
        let lookup = this.state.lookup;

        let approvalType = combinationAtXDockRule ? combinationAtXDockRule.approvalType : null;
        let approvalWorkflow = combinationAtXDockRule ? combinationAtXDockRule.approvalWorkflow : null;

        let approvalWorkflowElem = null;

        if(approvalType
            && approvalType.id == this.APPROVAL_TYPE_POSIBLE_WITH_APPROVAL_ID) {

            approvalWorkflowElem = <DropDown label="Approval Workflow" options={lookup.approvalWorkflow}
                                             value={approvalWorkflow}
                                             onclear={(value) => this.handleDataUpdate("combinationAtXDockRule", "approvalWorkflow", null)}
                                             onchange={(value) => this.handleDataUpdate("combinationAtXDockRule", "approvalWorkflow", value)}/>
        }

        return (
            <Grid>
                <GridCell width="1-4" noMargin={true}>
                    <DropDown label="Approval Type" options={lookup.approvalTypeExtended}
                              value={approvalType}
                              onclear={(value) => this.handleDataUpdate("combinationAtXDockRule", "approvalType", null)}
                              onchange={(value) => this.handleDataUpdate("combinationAtXDockRule", "approvalType", value)}/>
                </GridCell>
                <GridCell width="1-4" noMargin={true}>
                    {approvalWorkflowElem}
                </GridCell>
                <GridCell width="1-2" noMargin={true}/>
            </Grid>
        )
    }
    render() {

        let lookup = this.state.lookup;

        return (
            <Card title="Truck Load Type Rule"
                  toolbarItems={[{icon: this.retrieveShowHideIcon(), action: () => this.handleShowHideClick()}]}>
                <Grid hidden={this.state.isHidden}>
                    <GridCell width="1-1"><span>Collection to Warehouse by 3.party: </span></GridCell>
                    <GridCell width="1-1">
                        {this.renderCTWThirdPartyRuleBody()}
                    </GridCell>
                    <GridCell width="1-1"><span>Delivery from Warehouse by 3.party: </span></GridCell>
                    <GridCell width="1-1">
                        {this.renderDFWThirdPartyRuleBody()}
                    </GridCell>
                    <GridCell width="1-1"><span>Combination at Cross Dock: </span></GridCell>
                    <GridCell width="1-1">
                        {this.renderCombinationAtXDockRuleBody()}
                    </GridCell>
                    <GridCell width="1-10">
                        <Button label={"Save"} onclick={() => {this.handleSave()}}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}