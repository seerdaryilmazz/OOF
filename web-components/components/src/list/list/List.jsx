import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';
import {ListRow} from './row/ListRow';

export class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            headers: this.props.headers,
            data: this.props.data
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            headers: nextProps.headers,
            data: nextProps.data
        });
    }

    render() {
        let className = 'md-list ' + (this.state.headers.iconGroup ? "md-list-addon" : "");

        return (
            <div className="">
                <ul className={className}>
                    {
                        this.state.data.map(rowData => {
                                return (<ListRow key={uuid.v4()} headers={this.state.headers} rowData={rowData}/>);
                            }
                        )
                    }
                </ul>
            </div>
        );
    }
}
