import React from 'react';
import * as Datatable from 'susam-components/datatable'
import { ActionHeader, Card } from 'susam-components/layout';
import { Notify, Button } from 'susam-components/basic';
import { PricingRuleService } from '../../services';
import { Payweight } from './Payweight';

export class PayweightManagement extends React.Component {

    state = {
        payweights: []
    };

    constructor(props) {
        super(props);
        this.list();
    }

    list() {
        PricingRuleService.listPayweight().then(response => {
            this.setState({ payweights: response.data, payweight: null });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    delete(id) {
        PricingRuleService.deletePayweight(id).then(response => {
            this.list();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    newPayweight() {
        return {
            ranges: [{ minimum: 0 }]
        };
    }

    render() {
        if (this.state.payweight) {
            return <Payweight payweight={this.state.payweight} onSave={() => this.list()} onCancel={() => this.setState({ payweight: null })} />
        }

        return (<Card>
            <ActionHeader title="PW Ranges" tools={[{ title: "add", items: [{ label: "add", onclick: () => this.setState({ payweight: this.newPayweight() }) }] }]} />
            <Datatable.Table data={this.state.payweights}>
                <Datatable.Text field="name" />
                <Datatable.Bool field="defaultPayweight" />
                <Datatable.ActionColumn>
                    <Datatable.ActionWrapper track="onclick" onaction={(data => this.setState({ payweight: data }))}>
                        <Button label="edit" flat={true} style="success" size="mini" />
                    </Datatable.ActionWrapper>
                    <Datatable.ActionWrapper track="onclick" onaction={(data => this.delete(data.id))}>
                        <Button label="remove" flat={true} style="danger" size="mini" />
                    </Datatable.ActionWrapper>
                </Datatable.ActionColumn>
            </Datatable.Table>
        </Card>);
    }
}