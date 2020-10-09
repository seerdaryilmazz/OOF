import React from 'react';

export default ({task}) => {
    return (
        <li>
            <div className="md-list-addon-element">
                <i className="md-list-addon-icon uk-text-warning uk-icon-warning"></i>
            </div>
            <div className="md-list-content">
                <span className="md-list-heading">{task.name}</span>
                <span className="uk-text-small uk-text-muted uk-text-truncate">{task.remainingTime} min.</span>
            </div>
        </li>
    );
}