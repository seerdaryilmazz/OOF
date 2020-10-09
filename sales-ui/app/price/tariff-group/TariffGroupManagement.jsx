import React from 'react';
import { Button, Notify } from 'susam-components/basic';
import * as Datatable from 'susam-components/datatable';
import { ActionHeader, Card } from 'susam-components/layout';
import { PricingRuleService } from '../../services';
import { TariffGroup } from './TariffGroup';

export class TariffGroupManagement extends React.Component {

    state = {
        tariffGroups: []
    };

    constructor(props) {
        super(props);
        this.list();
    }

    list() {
        PricingRuleService.listTariffGroup().then(response => {
            this.setState({ tariffGroups: response.data, tariffGroup: null });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    newTariffGroup() {
        return {};
    }

    render() {
        if(this.state.tariffGroup){
            return <TariffGroup tariffGroup={this.state.tariffGroup} onSave={() => this.list()} onCancel={() => this.setState({ tariffGroup: null })} />
        }

        return (
            <Card>
                <ActionHeader title="Tariff Group" tools={[{ title: "add", items: [{ label: "add", onclick: () => this.setState({ tariffGroup: this.newTariffGroup() }) }] }]} />
                <Datatable.Table data={this.state.tariffGroups}>
                    <Datatable.Text field="name" />
                    <Datatable.Text field="code" />
                    <Datatable.ActionColumn>
                        <Datatable.ActionWrapper track="onclick" onaction={(data => this.setState({ tariffGroup: data }))}>
                            <Button label="edit" flat={true} style="success" size="mini" />
                        </Datatable.ActionWrapper>
                    </Datatable.ActionColumn>
                </Datatable.Table>
            </Card>
        )
    }
}