import React from 'react';
import * as axios from 'axios';

import {Notify, DropDown} from 'susam-components/basic';
import {Grid, GridCell} from 'susam-components/layout';
import {KartoteksService} from '../../services';

export class SectorSelector extends React.Component {

    constructor(props) {
        super(props);
        this.allowSubsectors = props.allowSubsectors ? props.allowSubsectors : false;
        this.state = {
            levelVersusSectors: [], // level = 0 means "root sectors"
            levelVersusSelectedSector: props.value ? props.value : []
        };
    };

    componentDidMount() {
        KartoteksService.getParentSectors().then((response) => {
            let levelVersusSectors = [];
            levelVersusSectors[0] = response.data;
            this.setState({levelVersusSectors: levelVersusSectors});
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    handleOnChange(level, value) {

        let levelVersusSectors = _.cloneDeep(this.state.levelVersusSectors);
        let levelVersusSelectedSector = _.cloneDeep(this.state.levelVersusSelectedSector);

        if (value) {

            if (this.allowSubsectors) {

                KartoteksService.getSubSectors(value.id).then((response) => {

                    levelVersusSectors.splice(level + 1);
                    levelVersusSelectedSector.splice(level);

                    if (response.data.length > 0) {
                        levelVersusSectors[level + 1] = response.data;
                    }
                    levelVersusSelectedSector[level] = value;

                    this.setState({levelVersusSectors: levelVersusSectors, levelVersusSelectedSector: levelVersusSelectedSector});

                }).catch((error) => {
                    Notify.showError(error);
                });

            } else {
                levelVersusSelectedSector[level] = value;
                this.setState({levelVersusSectors: levelVersusSectors, levelVersusSelectedSector: levelVersusSelectedSector});
            }

        } else {

            levelVersusSectors.splice(level + 1);
            levelVersusSelectedSector.splice(level);

            this.setState({levelVersusSectors: levelVersusSectors, levelVersusSelectedSector: levelVersusSelectedSector});
        }

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    render() {

        let levelVersusSectors = _.cloneDeep(this.state.levelVersusSectors);
        let levelVersusSelectedSector = _.cloneDeep(this.state.levelVersusSelectedSector);

        let gridCells = [];

        levelVersusSectors.forEach((element, index, array) => {

            let level = index;
            let label = level == 0 ? this.props.label : (this.props.sublabel ? this.props.sublabel : "");
            let selectedSector = levelVersusSelectedSector[level];
            let sectors = levelVersusSectors[level];

            gridCells.push(
                <GridCell key={"gridCell-" + level} width={"1-" + array.length} noMargin="true">
                    <DropDown label={label}
                              value={selectedSector}
                              options={sectors}
                              onchange={(value) => this.handleOnChange(level, value)}/>
                </GridCell>
            );
        });

        return (
            <Grid>
                {gridCells}
            </Grid>
        );
    }
}
