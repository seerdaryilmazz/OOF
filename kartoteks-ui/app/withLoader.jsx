import React from "react";
import {Loader} from 'susam-components/layout';

export function withLoader(WrappedComponent, title){
    class LoadingComponent extends React.Component {
        constructor(props){
            super(props);
            this.state = {busy: false};
        }
        isBusy(){
            return this.state.busy;
        }
        render() {
            if(this.isBusy()){
                return <Loader title = {title}/>;
            }
            return <WrappedComponent {...this.props} />;
        }
    }
    return LoadingComponent;
}