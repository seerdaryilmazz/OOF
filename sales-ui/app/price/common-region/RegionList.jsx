import React from 'react';
import { Grid, GridCell } from 'susam-components/layout/Grid';
import { Button } from 'susam-components/basic';

export class RegionList extends React.Component {
    render() {
        let { onEditClick, onDeleteClick } = this.props;
        return <ul className="md-list">
            {_.filter(this.props.regions, i => _.find([i.operation], o => _.isEqual(o, this.props.operation))).map((region, index) => {
                return (<li key={index}>
                    <Grid>
                        <GridCell width="1-4">
                            {region.name}
                        </GridCell>
                        <GridCell width="2-4">
                            {_.replace(region.postalCodes, new RegExp(",","g"), ', ' )}
                        </GridCell>
                        <GridCell width="1-4">
                            <Button label="edit" style="success" flat={true} onclick={() => onEditClick && onEditClick(region)} />
                            <Button label="remove" style="danger" flat={true} onclick={()=> onDeleteClick && onDeleteClick(region) } />
                        </GridCell>
                    </Grid>
                </li>);
            })}
        </ul>
    }
}