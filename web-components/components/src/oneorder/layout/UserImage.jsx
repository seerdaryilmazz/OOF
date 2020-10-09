import React from 'react';

export class UserImage extends React.Component {
    state = {errored: false};
    constructor(props) {
        super(props);
    }

    onError() {
        if (!this.state.errored) {
            this.setState({
                errored: true,
            });
        }
    }

    render() {
        let thumbnailPath = _.get(this.context.user, 'thumbnailPath');
        let content = null
        if (this.state.errored || !thumbnailPath) {
            content = <i className="material-icons md-24 md-light">person</i>;
        } else
            content = <img className="md-user-image dense-image dense-ready" src={`${baseResourceUrl}/user-images/${thumbnailPath}`} onError={() => this.onError()} />
        return (<div data-uk-tooltip="{pos:'bottom'}" title={_.get(this.context.user, 'displayName')}>
                    {content}
                </div>);
    }
}
UserImage.contextTypes = {
    user: React.PropTypes.object,
};