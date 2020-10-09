import React from 'react';

export class PageWizardTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    render() {

        let content = this.props.children;


        return (
            <span>
                {content}
            </span>
        );
    }
}
