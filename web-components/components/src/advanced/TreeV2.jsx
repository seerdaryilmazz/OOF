import React from "react";
import _ from "lodash";

import {TranslatingComponent} from '../abstract';

const indentationCellStyle = {
    //border: "1px solid black", // Hizaları kontrol ederken bunu açabiliriz.
    padding: "0px",
    minWidth: "20px"
};

const clickableIndentationCellStyle = {
    //border: "1px solid black", // Hizaları kontrol ederken bunu açabiliriz.
    padding: "0px",
    minWidth: "20px",
    fontStyle: "normal",
    fontSize: "16px",
    verticalAlign: "middle",
    textAlign: "left",
    cursor: "pointer"
};

export class TreeV2 extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            nodes: []
        };
    }
    
    componentDidMount() {
        this.setState({nodes: this.props.nodes});
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.nodes, nextProps.nodes)) {
            this.setState({nodes: nextProps.nodes});
        }
    }

    findMaxDepth(nodes) {

        let maxDepth = 0;

        if (nodes && nodes.length > 0) {
            maxDepth++;
            nodes.forEach(node => {
                let maxDepthOfNode = this.findMaxDepthOfNode(maxDepth, 1, node);
                if (maxDepthOfNode > maxDepth) {
                    maxDepth = maxDepthOfNode;
                }
            });
        }

        return maxDepth;
    }

    findMaxDepthOfNode(initialMaxDepth, depth, node) {

        let maxDepth = initialMaxDepth;

        if (node.hasChildNodes && node.showChildNodes && node.childNodes && node.childNodes.length > 0) {
            node.childNodes.forEach(childNode => {
                let maxDepthOfChild = this.findMaxDepthOfNode(maxDepth, depth + 1, childNode);
                if (maxDepthOfChild > maxDepth) {
                    maxDepth = maxDepthOfChild;
                }
            });
        } else {
            if (depth > maxDepth) {
                maxDepth = depth;
            }
        }

        return maxDepth;
    }

    renderNode(rows, depth, maxDepth, node) {

        let columns = [];

        for (let i = 1; i <= depth - 1; i++) {
            columns.push(
                <td key={columns.length + 1}>
                </td>
            );
        }

        if (node.hasChildNodes) {
            if (node.showChildNodes) {
                columns.push(
                    <td key={columns.length + 1} style={clickableIndentationCellStyle} onClick={() => this.handleCollapseClick(node)}>
                        &#9661;
                    </td>
                );
            } else {
                columns.push(
                    <td key={columns.length + 1} style={clickableIndentationCellStyle} onClick={() => this.handleExpandClick(node)}>
                        &#9655;
                    </td>
                );
            }
        } else {
            columns.push(
                <td key={columns.length + 1} style={indentationCellStyle}>
                </td>
            );
        }

        columns.push(
            <td key={columns.length + 1} width="100%" colSpan={maxDepth - depth + 1}>
                {node.content}
            </td>
        );

        rows.push(
            <tr key={rows.length + 1}>
                {columns}
            </tr>
        );

        if (node.hasChildNodes && node.showChildNodes && node.childNodes && node.childNodes.length > 0) {
            node.childNodes.forEach(childNode => {
                this.renderNode(rows, depth + 1, maxDepth, childNode);
            });
        }
    }

    renderNodes(nodes) {

        let rows = [];
        let depth = 0;

        if (nodes && nodes.length > 0) {

            let maxDepth = this.findMaxDepth(nodes);

            nodes.forEach(node => {
                this.renderNode(rows, depth + 1, maxDepth, node);
            });
        }

        return (
            <table width="100%">
                <tbody>
                {rows}
                </tbody>
            </table>
        );
    }

    handleExpandClick(node) {
        this.props.onExpand && this.props.onExpand(node);
    }

    handleCollapseClick(node) {
        this.props.onCollapse && this.props.onCollapse(node);
    }

    render() {
        return this.renderNodes(this.state.nodes);
    }
}

TreeV2.contextTypes = {
    translator: React.PropTypes.object
};