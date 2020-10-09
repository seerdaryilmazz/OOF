import React from 'react';

export class Path extends React.Component{

    constructor(props){
        super(props);
        this.state = {}
    }

    generatePath(){
        return `M 30 30 A 10 10 0 1 0 31 31 L 760 30 762 20 785 35 758 40 760 30`;
    }

    componentDidMount(){
        this.setState({path: this.generatePath()});
    }

    render(){
        return(
            <svg width="100%" height="20" viewBox="0 0 800 20" style = {{padding: "12px"}}
                 xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                            markerWidth="5" markerHeight="5"
                            orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z"
                              stroke="#757575" fill="#757575"/>
                    </marker>
                    <marker id="dot" viewBox="0 0 14 14" refX="7" refY="7"
                            markerWidth="7" markerHeight="7">
                        <circle cx="7" cy="7" r="7" fill="#757575" />
                        <circle cx="7" cy="7" r="4" fill="#FFFFFF" />
                    </marker>
                </defs>

                <path id = "path" d = "M 0 10 L 790 10"
                      stroke="#757575" strokeWidth = "3px"
                      fill = "transparent" strokeDasharray = "5"
                      markerStart = "url(#dot)" markerEnd="url(#arrow)"
                      />
            </svg>
        );
    }
}