import React from 'react';
import { HeaderWithBackground, Tab } from 'susam-components/layout';
import { RegionList } from '../common-region';

export class ForeignRegionCountry extends React.Component {

    newRegion(){
        let { tariff } = this.props;
        return {
            subsidiary: this.props.subsidiary,
            country: tariff.country,
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
            <HeaderWithBackground title={tariff.country.name} icon="plus" onIconClick={() => this.handleClick()} />
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