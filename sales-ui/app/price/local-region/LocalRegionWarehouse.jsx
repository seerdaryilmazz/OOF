import React from 'react';
import { HeaderWithBackground, Tab } from 'susam-components/layout';
import { RegionList } from '../common-region/RegionList';

export class LocalRegionWarehouse extends React.Component {

    newRegion(){
        let { tariff } = this.props;
        return {
            country: this.props.country,
            subsidiary: this.props.subsidiary,
            warehouse: tariff.warehouse,
        };
    }

    handleClick(region = this.newRegion()) {
        let { onClick } = this.props;
        onClick && onClick(region);
    }

    handleDeleteClick(region) {
        let { onDeleteClick } = this.props;
        onDeleteClick && onDeleteClick(region);
    }

    render() {
        let { tariff, lookup } = this.props;

        return (<div>
            <HeaderWithBackground title={tariff.warehouse.name} icon="plus" onIconClick={() => this.handleClick()} />
            <Tab labels={lookup.operations.map(i => i.name)} >
                {lookup.operations.map((operation, index) => 
                    <RegionList key={index} 
                        operation={operation} 
                        regions={tariff.regions} 
                        onEditClick={region=>this.handleClick(region)} 
                        onDeleteClick={region=>this.handleDeleteClick(region)} />)}
            </Tab>
        </div>)
    }
}