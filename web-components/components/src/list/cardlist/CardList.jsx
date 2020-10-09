import React from 'react';
import uuid from 'uuid';

import {CardListRow} from './row/CardListRow';

export class CardList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        this.state.headers = this.props.headers;
        this.state.data = JSON.parse(JSON.stringify(this.props.data));
    }


    render(){
        let headers = this.state.headers;
        let data = this.state.data;

        let self = this;

            return (
                <div className="md-card-list-wrapper">
                        <div className="md-card-list">
                            <ul className="md-list md-list-addon">
                                {
                                    data.map(function(rowData) {
                                            return(<CardListRow key={uuid.v4()} headers={headers} rowData={rowData}/>);
                                        }
                                    )
                                }
                            </ul>
                    </div>
                </div>
            );

    }

}
