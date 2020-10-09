import React from 'react';
import {Button} from '../../components/src/basic';


export default class OrderTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {source: [], count: 0};
    }
    

    render() {

        return (
        <div>
            <Button label="Test" onclick={this.clicked}/>
                <Button label="Test" onclick={this.clicked1}/>
                </div>

        );
    }

    clicked = () => {
      //  let c = new Confirmation();
        //c.co("Acaba", this.confirmed, this.rejected);

    }

    clicked1 = () => {
       // let c = new Confirmation();
       // c.confirm("Acaba", this.confirmed, this.rejected);

    }

    confirmed = () => {
        alert("aaaa");
    }

    rejected = () => {
        alert("aaaa");
    }
}
