import React from "react";
import {Grid, GridCell, Modal} from "susam-components/layout";
import {Button, Notify, TextInput} from "susam-components/basic";
import {Table} from "susam-components/table";
import {TranslatorService} from "./services/TranslatorService";

export class SupportedLocales extends React.Component {

    constructor(props) {
        super(props);
        this.headers = [
            {
                name: "ISO Code",
                data: "isoCode",
                width: "30%",
            },
            {
                name: "Name",
                data: "name",
                width: "30%"
            },
            {
                name: "Original Name",
                data: "originalName",
                width: "30%"
            }
        ];
        this.actions = {
            actionButtons: [],
            rowEdit: {
                icon: "pencil-square",
                action: this.handleRowEdit,
                title: "edit"
            },
            rowDelete: {
                icon: "close",
                action: this.handleRowDelete,
                title: "remove",
                confirmation: "Are you sure you want to delete?"
            },
            rowAdd: this.handleRowAdd
        };
        this.insertion = {
            isoCode: [<TextInput required={true}/>],
            name: [<TextInput required={true}/>],
            originalName: [<TextInput required={true}/>],
        };
        this.state = {
            supportedLocales: [],
        }
        this.loadSupportedLocales();
    }

    loadSupportedLocales() {
        TranslatorService.getSupportedLocales().then(response => {
            this.setState({supportedLocales: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleSupportedLocalesOnClick() {
        this.supportedLocalesModal.open();
    }

    handleSupportedLocalesModalClose() {
        this.supportedLocalesModal.close();
    }

    supportedLocalesChanged() {
        if (this.props.onchange) {
            this.props.onchange();
        }
    };

    handleRowAdd = (values) => {
        TranslatorService.updateSupportedLocale(values).then(response => {
            this.loadSupportedLocales();
            this.supportedLocalesChanged();
        }).catch(error => {
            Notify.showError(error);
        });
        return true;
    }

    handleRowEdit = (values, oldValues) => {
        TranslatorService.updateSupportedLocale(values).then(response => {
            this.loadSupportedLocales();
            this.supportedLocalesChanged();
        }).catch(error => {
            Notify.showError(error);
        });
        return true;
    }

    handleRowDelete = (values) => {
        TranslatorService.deleteSupportedLocale(values.id).then(response => {
            this.loadSupportedLocales();
            this.supportedLocalesChanged();
        }).catch(error => {
            Notify.showError(error);
        });
        return true;
    }

    render() {
        return (
            <div>
                <Grid>
                    <GridCell width="1-1">
                        <Button label="Supported Locales" onclick={()=>this.handleSupportedLocalesOnClick()}/>
                    </GridCell>
                </Grid>
                <Modal ref={(c)=>this.supportedLocalesModal = c} large={true} title="Supported Locales"
                       actions={[{label: "Close", action: () => this.handleSupportedLocalesModalClose()}]}>
                    <Table headers={this.headers} actions={this.actions}
                           insertion={this.insertion} data={this.state.supportedLocales}>
                    </Table>
                </Modal>
            </div>
        );
    }
}