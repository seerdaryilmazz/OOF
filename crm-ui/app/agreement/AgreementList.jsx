import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, Loader, Pagination} from "susam-components/layout";
import {AgreementService} from "../services/AgreementService";
import {ActionHeader} from "../utils";
import * as DataTable from 'susam-components/datatable';
import { Button} from 'susam-components/basic';
import uuid from 'uuid';

export class AgreementList extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
        };
    }

    componentDidMount() {
        this.setState({searchParams: this.getInitialSearchParams()}, () => this.search(1));
    }

    getInitialSearchParams() {
        return {};
    }

    search(pageNumber) {
        let params = {
            page: pageNumber - 1,
            size: 10
        };

        AgreementService.search(params).then(response => {
            this.setState({
                searchResult: response.data,
                pageNumber: pageNumber,
                pageCount: response.data.totalPages,
                ready: true
            });
        });
    }

    view(data) {
        window.open(`/ui/crm/agreement/view/${data.id}`, "_blank")
    }

    routeToAgreementForm(type) {
        this.context.router.push(`/ui/crm/agreement/new/${type}`);
    }

    renderAgreements() {
        let content;
        let title = "AGREEMENTS";

        if (_.isEmpty(this.state.searchResult.content)) {
            content = (
                <GridCell width="1-1">
                    {super.translate("No agreement")}
                </GridCell>
            );
        } else {
            content = (
                <DataTable.Table data={this.state.searchResult.content}>
                    <DataTable.Text header="Number" field="number" />
                    <DataTable.Text header="Name" maxLength="10" field="name"/>
                    <DataTable.Text header="Start Date" field="startDate"/>
                    <DataTable.Text header="End Date" field="endDate"/>
                    <DataTable.Text header="Service Areas" field="serviceAreas" printer = {new ListPrinter()} />
                    <DataTable.ActionColumn>
                        <DataTable.ActionWrapper track="onclick" onaction={(data) => this.view(data)}>
                            <Button icon="eye" size="small"/>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
            );
        }

        return (
            <GridCell width="1-1">
                <Card>
                    <Grid>
                        <GridCell width="1-1" noMargin={true}>
                            <ActionHeader title={title} tools={[{ title: "Add Agreement", items: [{ label: "Logistic Contract", onclick: () => this.routeToAgreementForm('LOGISTIC')}] }]} />
                        </GridCell>
                        <GridCell width="1-1">
                            {content}
                        </GridCell>
                        <GridCell width="1-1">
                            <Pagination totalElements={this.state.searchResult.totalElements}
                                        page={this.state.pageNumber}
                                        totalPages={this.state.pageCount}
                                        onPageChange={(pageNumber) => this.search(pageNumber)}
                                        range={10}/>
                        </GridCell>
                    </Grid>
                </Card>
            </GridCell>
        );
    }

    render() {
        if (!this.state.ready) {
            return (
                <Loader size="L"/>
            );
        } else {
            return (
                <Grid>
                    <GridCell width="1-1">
                        <Grid>
                            {this.renderAgreements()}
                        </Grid>
                    </GridCell>
                </Grid>
            )
        }
    }

}

AgreementList.contextTypes = {
    router: React.PropTypes.object,
    translator: PropTypes.object
};

class ListPrinter {
    print(data) {
        let nameArr = [];
        data.map(item => nameArr.push(item.name));
        return <div key={uuid.v4()}>{nameArr.join(",")}</div>;
    }
}