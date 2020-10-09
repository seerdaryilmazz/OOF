import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { EventMonitorService } from '../services/EventMonitorService';

export class EventGraph extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount(){
        EventMonitorService.getEventMap().then(response => {
            let graphData = this.buildEventGraph(response.data);
            this.setState({eventMap: response.data, eventGraph: graphData}, () => {
                this.loadGraph(graphData)
            });
        }).catch(error => {
            Notify.showError(error);
            console.log(error);
        });
    }
    search(){
        let eventGraph = this.buildEventGraph(this.state.eventMap, this.state.selectedEvent, this.state.selectedService);
        this.setState({eventGraph: eventGraph}, () => {
            this.loadGraph(eventGraph);
        });
    }
    loadGraph(data) {
        let nodes = data.nodes;
        let links = data.links;

        function getNeighbors(node) {
            return links.reduce(function (neighbors, link) {
                    if (link.target.id === node.id) {
                        neighbors.push(link.source.id)
                    } else if (link.source.id === node.id) {
                        neighbors.push(link.target.id)
                    }
                    return neighbors
                },
                [node.id]
            )
        }

        function isNeighborLink(node, link) {
            return link.target.id === node.id || link.source.id === node.id
        }


        function getNodeColor(node, neighbors) {
            if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
                return node.type === "Event" ? '#e53935' : '#00897b';
            }
            return node.type === "Event" ? '#e57373' : '#4db6ac';
        }
        function getNodeStrokeColor(node) {
            return node.type === "Event" ? '#c62828' : '#00695c';

        }


        function getLinkColor(node, link) {
            return isNeighborLink(node, link) ? (link.type == "Produced By" ? '#37474f' : '#607d8b') : (link.type === "Produced By" ? '#795548' : '#bcaaa4');
        }

        function getTextColor(node, neighbors) {
            return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? '#37474f' : '#795548';
        }

        let width = $("#svgContainer").width();
        let height = $("#svgContainer").height();
        let radius = 15;

        let svg = d3.select('svg');
        svg.selectAll("*").remove();
        svg.attr('width', width).attr('height', height);

        svg.append('defs').append('marker')
            .attrs({'id':'arrowhead-end',
                'viewBox':'-0 -5 10 10',
                'refX':radius + 10,
                'refY':0,
                'orient':'auto',
                'markerWidth':5,
                'markerHeight':5,
                'xoverflow':'visible'})
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#795548')
            .style('stroke','none');
        svg.select('defs').append('marker')
            .attrs({'id':'arrowhead-start',
                'viewBox':'-10 -5 10 10',
                'refX':-(radius + 10),
                'refY':0,
                'orient':'auto',
                'markerWidth':5,
                'markerHeight':5,
                'xoverflow':'visible'})
            .append('svg:path')
            .attr('d', 'M 0,-5 L -10,0 L 0,5')
            .attr('fill', '#795548')
            .style('stroke','none');

// simulation setup with all forces
        let linkForce = d3
            .forceLink()
            .id(function (link) { return link.id })
            .strength(function (link) { return 0.1 })
            .distance(function (link) { return link.type === "Produced By" ? 50 : 100 });

        let simulation = d3
            .forceSimulation()
            .force('link', linkForce)
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2));

        let dragDrop = d3.drag().on('start', function (node) {
            node.fx = node.x;
            node.fy = node.y;
        }).on('drag', function (node) {
            simulation.alphaTarget(0).restart();
            node.fx = d3.event.x;
            node.fy = d3.event.y;
        }).on('end', function (node) {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            node.fx = null;
            node.fy = null;
        });

        function selectNode(selectedNode) {
            let neighbors = getNeighbors(selectedNode)

            // we modify the styles to highlight selected nodes
            nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
            textElements.attr('fill', function (node) { return getTextColor(node, neighbors) })
            linkElements.attr('stroke', function (link) { return getLinkColor(selectedNode, link) })
        }

        let linkElements = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", function(link) {return (link.type === "Produced By" ? '4,4' : '2,2')})
            .attr("stroke", function(link) {return (link.type === "Produced By" ? '#795548' : '#bcaaa4')})
            .attr('marker-end', function(link) {return (link.type === "Produced By" ? null : 'url(#arrowhead-end)')})
            .attr('marker-start', function(link) {return (link.type === "Produced By" ? 'url(#arrowhead-start)' : null)});




        let nodeElements = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", radius)
            .attr("fill", getNodeColor)
            .attr('stroke', getNodeStrokeColor)
            .attr('stroke-width', 2)
            .call(dragDrop)
            .on('click', selectNode);

        let textElements = svg.append("g")
            .attr("class", "texts")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .text(function (node) { return  node.name })
            .attr("font-size", 13)
            .attr("fill", "#795548")
            .attr("dx", 20)
            .attr("dy", 4);

        simulation.nodes(nodes).on('tick', () => {
            let margin = radius + 10;
            nodeElements
                .attr('cx', function (node) { return node.x < margin ? margin : (node.x > (width-margin) ? (width-margin) : node.x) })
                .attr('cy', function (node) { return node.y < margin ? margin : (node.y > (height-margin) ? (height-margin) : node.y) })
            textElements
                .attr('x', function (node) { return node.x < margin ? margin : (node.x > (width-margin) ? (width-margin) : node.x) })
                .attr('y', function (node) { return node.y < margin ? margin : (node.y > (height-margin) ? (height-margin) : node.y) })

            linkElements
                .attr('x1', function (link) { return link.source.x })
                .attr('y1', function (link) { return link.source.y })
                .attr('x2', function (link) { return link.target.x })
                .attr('y2', function (link) { return link.target.y })
        })

        simulation.force("link").links(links)
    }


    buildEventGraph(eventMap, selectedEvent, selectedService){
        let eventGraph = {nodes:[], links: []};
        let data = eventMap;
        if(selectedService){
            data = _.filter(eventMap, {applicationName: selectedService.name});
        }

        data.forEach(serviceEvents => {
            let hasEvents = false;

            if(serviceEvents.consumes){
                let events = _.filter(serviceEvents.consumes, event => {
                    return event.name != "register-events" && event.name != "authorization";
                });
                if(selectedEvent){
                    events = _.filter(events, {name: selectedEvent.name});
                }
                events.forEach(event => {
                    hasEvents = true;
                    if(!_.find(eventGraph.nodes, {id: event.name})){
                        eventGraph.nodes.push({
                            id: event.name,
                            name: event.name,
                            level: 1,
                            type: "Event"
                        });
                    }
                    eventGraph.links.push({
                        target: serviceEvents.applicationName,
                        source: event.name,
                        type: "Consumed By"
                    });
                });
            }
            if(serviceEvents.produces) {
                let events = _.filter(serviceEvents.produces, event => {
                    return event.name != "register-events" && event.name != "authorization";
                });
                if(selectedEvent){
                    events = _.filter(events, {name: selectedEvent.name});
                }
                events.forEach(event => {
                    hasEvents = true;
                    if (!_.find(eventGraph.nodes, {id: event.name})) {
                        eventGraph.nodes.push({
                            id: event.name,
                            name: event.name,
                            level: 1,
                            type: "Event"
                        });
                    }
                    eventGraph.links.push({
                        target: serviceEvents.applicationName,
                        source: event.name,
                        type: "Produced By"
                    });
                });

            }
            if(hasEvents){
                eventGraph.nodes.push({
                    id: serviceEvents.applicationName,
                    name: serviceEvents.applicationName,
                    level: 2,
                    type: "Service"
                });
            }
        });
        return eventGraph;
    }

    handleShowLogs(){
        this.props.onShowLogs && this.props.onShowLogs();
    }
    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state, () => this.search());
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-4">
                    <DropDown label = "Events" options = {this.props.events}
                              value = {this.state.selectedEvent}
                              onchange = {(value) => this.updateState("selectedEvent", value)}/>
                </GridCell>
                <GridCell width="1-4">
                    <DropDown label="Services" options = {this.props.services}
                              value = {this.state.selectedService}
                              onchange = {(value) => this.updateState("selectedService", value)}/>
                </GridCell>
                <GridCell width="1-4" />
                <GridCell width = "1-4">
                    <Button label="Show Logs" size="small" style="primary"
                                     onclick = {() => this.handleShowLogs()} />
                </GridCell>
                <GridCell width="1-1">
                    <div id="svgContainer"
                         style = {{backgroundColor: "#F3F3F3", border: "1px solid #d3d3d3",
                             width:"100%", height: "100%", minHeight: "600px"}}>
                        <svg />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}