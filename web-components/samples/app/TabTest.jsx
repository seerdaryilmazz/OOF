import React from 'react';


import {Tab} from '../../components/src/layout/Tab';
import {Button} from '../../components/src/basic';


export default class Test extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
    };

    render() {
        return (
            <div className="md-card">
                <div className="md-card-content">

                    <Tab labels={["Section A","Section B","Section C"]} active="Section B" currPageUrl="#/tab" animation="slide-bottom" >
                        <Button label="AA" type="submit"/>
                        <Button label="BB" type="submit"/>
                        <Tab labels={["Section A","Section B","Section C"]} active="Section B" currPageUrl="#/tab" animation="fade" align="horizontal">
                            <Button label="AA" type="submit"/>
                            <Button label="BB" type="submit"/>
                            <Tab labels={["Section A","Section B"]} active="Section A" currPageUrl="#/tab" animation="slide-bottom" >
                                <Button label="AA" type="submit"/>
                                <Button label="BB" type="submit"/>
                            </Tab>
                        </Tab>
                    </Tab>


                </div>
            </div>

        );
    }



}
