import React from "react";
import uuid from "uuid";
import _ from "lodash";
import {Grid, GridCell} from "../layout";

export class Sortable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id ? this.props.id : uuid.v4(),
            keyField: this.props.keyField ? this.props.keyField : "id",
            displayField: this.props.displayField ? this.props.displayField : "name",
            lastItems: null,
        };
    }

    initSortable() {
        let sortable = $('#' + this.state.id);
        let options = {};
        if(this.props.handleClass){
            options.handleClass = this.props.handleClass;
        }
        if(this.props.dragCustomClass){
            options.dragCustomClass = this.props.dragCustomClass;
        }
        UIkit.sortable(sortable, options);

        if (this.props.onchange) {
            sortable.on('stop.uk.sortable', (e, so, de, a) => {
                let result = [];

                sortable.find('li').each((index, li)=> {
                    let filtered = _.filter(this.props.items, item => {
                        let val = _.get(item, this.state.keyField);
                        return _.isEqual(
                            _.isNumber(val) ? val.toString() : val,
                            $(li).attr('id'));
                    });

                    if (filtered && filtered.length == 1) {
                        result.push(filtered[0]);
                    }
                });

                if (!_.isEqual(this.state.lastItems, result)) {
                    this.setState({lastItems: result});
                    this.props.onchange(result);
                }
            });
        }
    }

    componentDidMount() {
        this.initSortable();
    }

    componentDidUpdate() {
        this.initSortable();
    }

    renderItem(item) {
        let buttons = null;
        let width = "1-1";
        if (this.props.buttons && this.props.buttons.length > 0) {
            buttons = <GridCell width="1-10" noMargin="true">{
                this.props.buttons.map(button => {
                    let className = "uk-icon-hover uk-icon-" + button.icon;
                    return <a href="javascript:void(0)" className={className} onClick={() => button.action(item)}></a>
                })
            }</GridCell>;
            width = "9-10";
        }

        return (
            <Grid>
                <GridCell width={width} noMargin="true">
                    {this.props.renderItem ? this.props.renderItem(item) : item[this.state.displayField]}
                </GridCell>
                {buttons}
            </Grid>
        )
    }

    render() {
        let items = [];

        if (this.props.items && this.props.items.length > 0) {
            items = this.props.items.map(item => {
                let val = _.get(item, this.state.keyField);
                return (
                    <li key={val} id={val} style={{borderWidth: 0}}>
                        {this.renderItem(item)}
                    </li>
                );
            })
        }
        return (
            <ul key={this.state.id} id={this.state.id} className="uk-sortable md-list">
                {items}
            </ul>
        );
    }
}