import _ from "lodash";
import React from "react";
import { Grid, GridCell } from "susam-components/layout";

export default class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.data, nextProps.data)) {
            this.loadGraph(nextProps);
        }
    }
    loadGraph(props) {
        var Color = require('color');
        let { colors, selectedNode, onNodeSelect, onNodeDoubleClick, data } = props;

        let nodes = data.nodes;
        let links = data.links.map(i => {
            return {
                source: i.source.id,
                target: i.target.id,
                type: i.type
            }
        });


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


        function getNodeColor(node, neighbors, selectedNode) {
            let color = Color(colors.nodes[node.type]);
            if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
                if (selectedNode && node.id === selectedNode.id) {
                    return color.darken(0.3);
                }
                return color;
            }
            return color.lighten(0.9);
        }

        function getNodeStrokeColor(node, selectedNode) {
            // if (selectedNode && node.id === selectedNode.id) {
            //     return Color(colors.selectedNode).darken(0.3);
            // }
            return Color(colors.nodes[node.type]).darken(0.5);
        }


        function getLinkColor(node, link) {
            let color = Color(colors.links[link.type].stroke);
            return isNeighborLink(node, link) ? color.lighten(0.9) : color;
        }

        function getTextColor(node, neighbors) {
            let color = Color(colors.text.fill);
            return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? color : color.lighten(0.9);
        }

        function substring(string, length) {
            if (string.length > length) {
                return string.substring(0, length) + "..";
            }
            return string;
        }

        let width = $("#svgContainer").width();
        let height = $("#svgContainer").height();
        let radius = 35;

        let svg = d3.select('svg');
        svg.selectAll("*").remove();
        svg.attr('width', width).attr('height', height);

        svg.append('defs').append('marker')
            .attrs({
                'id': 'arrowhead-end',
                'viewBox': '-0 -5 10 10',
                'refX': radius + 10,
                'refY': 0,
                'orient': 'auto',
                'markerWidth': 5,
                'markerHeight': 5,
                'xoverflow': 'visible'
            })
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#795548')
            .style('stroke', 'none');
        svg.select('defs').append('marker')
            .attrs({
                'id': 'arrowhead-start',
                'viewBox': '-10 -5 10 10',
                'refX': -(radius + 10),
                'refY': 0,
                'orient': 'auto',
                'markerWidth': 5,
                'markerHeight': 5,
                'xoverflow': 'visible'
            })
            .append('svg:path')
            .attr('d', 'M 0,-5 L -10,0 L 0,5')
            .attr('fill', '#795548')
            .style('stroke', 'none');

        // simulation setup with all forces
        let linkForce = d3
            .forceLink()
            .id(function (link) { return link.id })
            .strength(function (link) { return 0.1 })
            .distance(function (link) { return 125 });

        let simulation = d3
            .forceSimulation()
            .force('link', linkForce)
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2));

        let dragDrop = d3.drag().on('start', function (node) {
            hideTooltip();
            node.fx = node.x;
            node.fy = node.y;
        }).on('drag', function (node) {
            hideTooltip();
            simulation.alphaTarget(0).restart();
            node.fx = d3.event.x;
            node.fy = d3.event.y;
        }).on('end', function (node) {
            hideTooltip();
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            node.fx = null;
            node.fy = null;
        });

        function selectNode(selectedNode) {
            let neighbors = getNeighbors(selectedNode)

            // we modify the styles to highlight selected nodes
            // nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
            nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors, selectedNode) })
            nodeElements.attr('stroke', function (node) { return getNodeStrokeColor(node, selectedNode) })
            textElements.attr('fill', function (node) { return getTextColor(node, neighbors) })
            linkElements.attr('stroke', function (link) { return getLinkColor(selectedNode, link) })

            onNodeSelect && onNodeSelect(selectedNode);
        }

        function showTooltip(event, node) {
            let tooltip = document.getElementById("tooltip");
            tooltip.innerHTML = node.type +": "+ node.name;
            tooltip.style.display = "flex";
            tooltip.style.left = event.pageX + 16 + 'px';
            tooltip.style.top = event.pageY + 16 + 'px';
        }

        function hideTooltip() {
            var tooltip = document.getElementById("tooltip");
            tooltip.style.display = "none";
        }

        let linkElements = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", function (link) { return colors.links[link.type].style })
            .attr("stroke", function (link) { return colors.links[link.type].stroke })
            .attr('marker-end', 'url(#arrowhead-end)');

        let nodeElements = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", radius)
            .attr("fill", (node) => getNodeColor(node, getNeighbors(selectedNode), selectedNode))
            .attr('stroke', (node) => getNodeStrokeColor(node, selectedNode))
            .attr('stroke-width', 3)
            .call(dragDrop)
            .on('dblclick', (node=>onNodeDoubleClick(node)))
            .on('mouseover', (node)=>showTooltip(event, node))
            .on('mouseout', ()=>hideTooltip());

        let textElements = svg.append("g")
            .attr("class", "texts")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .text(function (node) { return substring(node.name, 7) })
            .attr("font-size", 13)
            .attr("fill", "#795548")
            .attr("dx", -30)
            .attr("dy", 4);

        simulation.nodes(nodes).on('tick', () => {
            let margin = radius + 14;
            nodeElements
                .attr('cx', function (node) { return node.x < margin ? margin : (node.x > (width - margin) ? (width - margin) : node.x) })
                .attr('cy', function (node) { return node.y < margin ? margin : (node.y > (height - margin) ? (height - margin) : node.y) })
            textElements
                .attr('x', function (node) { return node.x < margin ? margin : (node.x > (width - margin) ? (width - margin) : node.x) })
                .attr('y', function (node) { return node.y < margin ? margin : (node.y > (height - margin) ? (height - margin) : node.y) })

            linkElements
                .attr('x1', function (link) { return link.source.x })
                .attr('y1', function (link) { return link.source.y })
                .attr('x2', function (link) { return link.target.x })
                .attr('y2', function (link) { return link.target.y })
        })

        simulation.force("link").links(links)
    }

    render() {
        let style = {
            backgroundColor: "#F3F3F3",
            border: "1px solid #d3d3d3",
            width: this.props.width || "100%",
            height: this.props.height || `${window.innerHeight-290}px`,
            minHeight: this.props.minHeight || "600px"
        }

        let tooltipStyle = {
            position: "fixed", 
            display: "none", 
            background: "cornsilk",
            border: "1px solid black",
            borderRadius: "5px",
            padding: "5px"
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <div id="tooltip" style={tooltipStyle}></div>
                    <div id="svgContainer"
                        style={style}>
                        <svg />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}