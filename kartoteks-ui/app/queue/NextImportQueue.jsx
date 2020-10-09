import PropTypes from 'prop-types';
import React from "react";
import { Loader } from "susam-components/layout";
import { ImportQueueService } from '../services/KartoteksService';



export class NextImportQueue extends React.Component {
    constructor(props) {
        super(props);
        this.state = {filter: {}};
    }

    componentDidMount(){
        let filter = {};
        if(localStorage.getItem("queueSearchFilter")){
            filter = JSON.parse(localStorage.getItem("queueSearchFilter"));
        }else{
            this.context.router.push('/ui/kartoteks/import-queue');
        }
        this.setState({filter: filter});
        this.search(filter);
    }

    search(filter){
        if(filter.dateRange){
            filter.startDate = filter.dateRange.startDate;
            filter.endDate = filter.dateRange.endDate;
        }
        ImportQueueService.list(filter).then(response => {
            if(response.data && response.data.length > 0){
                this.handleImportClick(response.data[0]);
            }
        }).catch(error => {
            Notify.showError(error);
            setTimeout(() => {this.context.router.push('/ui/kartoteks/import-queue')}, 1000);
        });
    }
    handleImportClick(queue){
        this.context.router.push('/ui/kartoteks/import-queue/' + queue.id);
    }

    render(){
        return <Loader/>;
    }
}
NextImportQueue.contextTypes = {
    router: PropTypes.object.isRequired
};