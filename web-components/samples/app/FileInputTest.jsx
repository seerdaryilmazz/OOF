

import React from 'react';


import {FileInput} from '../../components/src/advanced';


export default class FileInputTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    finished = () => {
        alert("This wizard is Finished");
    }

    componentDidMount() {
        $('.dropify').dropify();
    }

    render() {
        return (

            <FileInput  />

        );
    }
    

}




