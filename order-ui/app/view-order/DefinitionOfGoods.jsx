import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { Modal } from 'susam-components/layout/Modal';
import uuid from "uuid";
import { DefinitionOfGoodsList } from '../create-order/steps/DefinitionOfGoodsList';

export class DefinitionOfGoods extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = { shipment: _.clone(this.props.shipment) };
    }

    handleSaveItem() {
        let shipment = _.cloneDeep(this.state.shipment);
        shipment = this.filterItemsByTemplate(shipment);
        shipment = this.filterEmptyItems(shipment)
        this.setState({ shipment: shipment }, () => this.saveItems(shipment));
        this.closeModal();
    }

    filterItemsByTemplate(shipment) {
        let filteredGoods = [];
        if (this.props.senderTemplate && !_.isEmpty(this.props.senderTemplate.goods)) {
            shipment.definitionOfGoods.forEach(item => {
                let found = _.find(this.props.senderTemplate.goods, { id: item.hscodeId });
                if (found) {
                    item.code = found.code;
                    item.name = found.name;
                    filteredGoods.push(item);
                }
            });
            shipment.definitionOfGoods = filteredGoods;
        }
        return shipment;
    }

    filterEmptyItems(shipment) {
        shipment.definitionOfGoods = _.filter(shipment.definitionOfGoods, item => { return !_.isEmpty(item) });
        return shipment;
    }

    saveItems(shipment) {
        this.props.onSave && this.props.onSave({ definitionOfGoods: shipment.definitionOfGoods });
    }

    handleOnChange(value) {
        let shipment = _.clone(this.state.shipment);
        shipment.definitionOfGoods = value.map(item => this.reverseMap(item));
        this.setState({ shipment: shipment });
    }

    closeModal() {
        this.setState({ shipment: null, active: false }, () => this.modal.close())
    }

    openModal() {
        this.setState({ shipment: _.clone(this.props.shipment), active: true }, () => this.modal.open());
    }

    reverseMap(item) {
        if (_.isEmpty(item)) {
            return item;
        } else {
            let existing = _.find(this.state.shipment.definitionOfGoods, { hscodeId: item.id });
            return {
                id: existing ? existing.id : null,
                name: item.name,
                code: item.code,
                hscodeId: item.id,
            }
        }
    }

    map(item) {
        if (_.isEmpty(item)) {
            return item;
        } else {
            return {
                id: item.hscodeId,
                name: item.name,
                code: item.code,
                label: item.label ? item.label : _.trim(_.defaultTo(item.code, "") + " " + item.name),
            };
        }
    }

    renderDefinitionOfGoodsEditButton() {
        if (this.props.editable) {
            return (
                <div className="uk-text-center">
                    <Button label="Edit Definition of Goods" style="primary" flat={true} size="small"
                        onclick={() => this.openModal()} />
                </div>
            )
        }
        return null;
    }

    renderDefinitionOfGoods() {
        let goodsList = <div><span className="uk-text-muted" style={{ marginTop: "12px" }}>{super.translate("No definition of goods")}</span></div>;
        let isGoodsListEmpty = _.isEmpty(this.props.shipment.definitionOfGoods);
        if (!isGoodsListEmpty) {
            goodsList = (<ul className="md-list">
                {this.props.shipment.definitionOfGoods.map(item => {
                    return (
                        <li key={uuid.v4()} style={{ minHeight: "24px" }}>
                            <Grid>
                                <GridCell width="1-3" noMargin={true}>HS: {item.code}</GridCell>
                                <GridCell width="2-3" noMargin={true}>{item.name}</GridCell>
                            </Grid>
                        </li>
                    );
                })}
            </ul>);
        }
        return (
            <div style={{ margin: "0 48px 0 0" }}>
                <span className="label">{super.translate("Definition of Goods")}</span>
                {goodsList}
                {this.renderDefinitionOfGoodsEditButton()}
                {this.renderModal(this.state.shipment)}
            </div>
        );
    }

    renderModal(shipment) {
        return (
            <Modal ref={c => this.modal = c}
                medium={true} minHeight={640} closeOtherOpenModals={false}
                actions={[{ label: "Close", action: () => this.closeModal() }, { label: "Save", action: () => this.handleSaveItem() }]}>
                <DefinitionOfGoodsList options={this.props.senderTemplate ? this.props.senderTemplate.goods : []}
                        value={shipment?shipment.definitionOfGoods.map(item => { return this.map(item) }):[]}
                        active={this.state.active}
                        activeIndex={shipment?shipment.definitionOfGoods.length:0}
                        onChange={(value) => this.handleOnChange(value)} />
            </Modal>
        );
    }

    render() {
        return (
            <div>
                <Grid>
                    <GridCell width="1-1">
                        {this.renderDefinitionOfGoods()}
                    </GridCell>
                </Grid>
            </div>
        );
    }
}

DefinitionOfGoods.contextTypes = {
    translator: PropTypes.object
};