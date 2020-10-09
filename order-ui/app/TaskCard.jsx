import React from 'react';
import TaskList from './TaskList.jsx';


export default  class TaskCard extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
           events:{}
        };
    };

    componentDidMount(){
        console.log("ComponentDidMount");
        $.ajax({
            url:'/task-service/event/',
            type:'GET',
            //data: JSON.stringify(taskParams),
            contentType: "application/json; charset=utf-8",
            success:function(res){
              //  var events = res;
              //  console.log(JSON.stringify(events));
                console.log(JSON.stringify(res));
            },
            error:function(res){
                console.log(JSON.stringify(res));
            }

        });
    }

        render() {
            var tasks = [
                {id:1, name:"i am a todo task", remainingTime:15, status:"TODO"},
                {id:2, name:"i am in progress task 1", remainingTime:20, status:"IN_PROGRESS"},
                {id:3, name:"i am in progress task 2", remainingTime:20, status:"IN_PROGRESS"},
                {id:4, name:"i am in progress task 3", remainingTime:20, status:"IN_PROGRESS"},
                {id:5, name:"i am in progress task 4", remainingTime:20, status:"IN_PROGRESS"}
            ];



            var todos = tasks.filter(task => task.status === "TODO");
            var inProgress = tasks.filter(task => task.status === "IN_PROGRESS");

            return (
                 <div className="uk-grid" data-uk-grid-margin data-uk-grid-match id="user_profile">
                     <div className="uk-width-large-3-10">
                        <div className="md-card">
                            <div className="md-card-content">
                        <TaskList tasks={todos} status="TODO"/>
                        <TaskList tasks={inProgress} status="IN_PROGRESS"/>

                            </div>
                        </div>
                    </div>
                </div>
                );
        }
}