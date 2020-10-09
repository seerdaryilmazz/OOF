import React from 'react';
import _ from 'lodash';
import d3 from 'd3';

export class d3Funcs {
    constructor(props){
        if(props.onclick)
        this.onclick = props.onclick;
        this.width = 950;
        this.height = 500;
        this.force = d3.layout.force()
            .charge(-200)
            .linkDistance(70)
            .size([this.width, this.height]);
        this.state = {value:{}}
    }





// *****************************************************
// ** d3 functions to manipulate attributes
// *****************************************************
    createForce=()=>{
        return this.force;

    }
     enterNode = (selection) => {
        selection.classed('node', true);

        selection.append('circle')
            .attr("r", (d) => d.size)
            .attr('class', 'ring')
            .attr('fill', "blue")
            .attr('id',(d)=>d.klass)
            .call(this.force.drag);

        selection.append('text')
            .attr("x", (d) => d.size)
            .attr("dy",(d)=>".35em")
            .attr('fill', "gray")
            .text((d) => d.label);
    };

  updateNode = (selection) => {
        selection.attr("transform", (d) => "translate(" + d.x/2 + "," + d.y/2 + ")");
    };

    handleClick(value){
        let state = _.cloneDeep(this.state);
        state.value = value;
        this.setState(state);

    }
    addEvent = (selection)=>{


    selection.on("click", (d) =>{
       if(this.onclick)
           this.onclick(d);

       /* selection.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
            .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(d) {
                console.log("mouse Over");
            })
            .on("mouseout", function(d) {
                console.log("mouse Out");
            });*/
    });

    }
     enterLink = (selection) => {
        selection.classed('link', true)
            .attr("stroke-width", (d) => d.size);
    };

     updateLink = (selection) => {
        selection.attr("x1", (d) => (d.source.x)/2)
            .attr("y1", (d) => (d.source.y)/2)
            .attr("x2", (d) => (d.target.x)/2)
            .attr("y2", (d) => (d.target.y)/2);
    };

     updateGraph = (selection) => {
        selection.selectAll('.node')
            .call(this.updateNode);
        selection.selectAll('.link')
            .call(this.updateLink);
    };

    responsivefy= (selection)=> {

        console.log("responsify");
    // get container + svg aspect ratio
    var container = d3.select(selection.node().parentNode),
        width = parseInt(selection.style('width')),
        height = parseInt(selection.style('height')),
        aspect = width / height;

        console.log("width--->"+width+"- "+"height-->"+height+" - "+" aspect--> "+aspect);

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
        selection.attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('preserveAspectRatio', 'xMinYMid')
        .call(resize);

    // to register multiple listeners for same event type,
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on('resize.' + container.attr('id'), resize);

    // get width of container and resize svg to fit it
    resize= ()=> {
        var targetWidth = parseInt(container.style('width'));
        selection.attr('width', targetWidth);
        selection.attr('height', Math.round(targetWidth / aspect));
    }
}

}
