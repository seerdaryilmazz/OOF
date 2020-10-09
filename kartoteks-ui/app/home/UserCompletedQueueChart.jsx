import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as d3 from "d3";

import {Notify} from 'susam-components/basic';

import {ImportQueueService} from '../services/KartoteksService';

export class UserCompletedQueueChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

    }
    getTranslation(transform) {
        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttributeNS(null, "transform", transform);
        let matrix = g.transform.baseVal.consolidate().matrix;
        return [matrix.e, matrix.f];
    }

    drawChart(data){
        if(!data){
            return;
        }
        let svg = d3.select("svg#userCompletedQueueChart"),
            margin = {top: 10, right: 30, bottom: 20, left: 30},
            width = $("#userCompletedQueueChart").width() - margin.left - margin.right,
            height = $("#userCompletedQueueChart").height() - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let index = 0;
        let graphData = data.map(item => {
            index++;
            let r = (item.count / 5) + 5; //scale count with 5 and add 5 to make it visible even if r is 1..
            return {r: r, x: 0, y: height/2, count: item.count, date: item.date}
        });

        var xAxis = d3.axisBottom(
                d3.scaleBand()
                    .domain(graphData.map(item => {return item.date}))
                    .range([0, width]));

        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);


        let div = d3.select("body").append("div")
            .attr("class", "uk-tooltip uk-tooltip-bottom");

        //trying to match center of the bubbles with tick marks.
        // |------|---------------|-----------------------------
        // empty  first           second

        let emptyTick = g.selectAll(".tick").filter(function(d, i) { return i == 0; });
        let firstTick = g.selectAll(".tick").filter(function(d, i) { return i == 1; });
        let secondTick = g.selectAll(".tick").filter(function(d, i) { return i == 2; });
        if(!firstTick.empty() && !emptyTick.empty()){
            let tickMargin = this.getTranslation(firstTick.attr("transform"))[0] - this.getTranslation(emptyTick.attr("transform"))[0];
            let step = this.getTranslation(secondTick.attr("transform"))[0] - this.getTranslation(firstTick.attr("transform"))[0];
            graphData.forEach((item,i) => {
                item.x = (tickMargin / 2) + margin.left + (step * i);
            });
        }


        let node = svg.selectAll(".node")
            .data(graphData)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d) => { return "translate(" + d.x + "," + d.y + ")"; });

            node.append("circle")
                .attr("r", (d) => {return d.r;})
                .attr("fill", "rgba(117, 107, 177, 0.425)")
                .on("mouseover", (d) => {
                    div.html(d.count + " items completed")
                        .style("display", "block")
                        .style("left", (d3.event.pageX - 25) + "px")
                        .style("top", (d3.event.pageY - 60) + "px");
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);

                })
                .on("mouseout", (d) => {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        $( window ).resize(() => {
            clearTimeout(this.resize);
            this.resize = setTimeout(() => this.handleResize(), 200);
        });
    }
    componentDidMount(){
        ImportQueueService.myStats().then(response => {
            let data = [];
            _.forEach(response.data, (value, key) => {
                data.push({date: key, count: value});
            });
            this.setState({data: data});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    componentDidUpdate(){
        if(this.state.data){
            this.drawChart(this.state.data);
        }
    }
    componentWillReceiveProps(nextProps){

    }
    handleResize(){
        $("svg#userCompletedQueueChart").empty();
        this.drawChart(this.state.data);
    }

    render(){
        return <svg id="userCompletedQueueChart" width="100%" height="100%" />;
    }

}