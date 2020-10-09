import React from 'react';
import TaskRow from './TaskRow.jsx';

export default ({tasks, status}) => {
    return (
<div className="uk-margin-medium-bottom">
    <h3 className="heading_c uk-margin-bottom">{status}</h3>
    <ul className="md-list md-list-addon">
        {tasks.map(task =>
            <TaskRow key={task.id} task={task}/>
        )}
        <li>
            <div  id="app" className="md-list-content"></div>
        </li>
    </ul>
</div>
    );
}