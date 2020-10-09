import React from 'react';
import _ from 'lodash';

export class generate_data {
    constructor(props){


    }

    createFromGraphData=(graphnodes,graphLinks,width,height)=>{

        var nodesFrom = _.chain(graphnodes)
            .map((eachGraphNode)=>{
                var node = {};
                node.key = eachGraphNode.code;
                node.size = _.random(10,20);
                node.klass= eachGraphNode.type;
                node.label = eachGraphNode.name;

                return node;
            })
            .value();

        var linksFrom = _.chain(graphLinks)
            .map((eachLink)=> {
                var link = {};
                var source = this.findIndexByCode(graphnodes,eachLink.fromNodeCode);
                var target = this.findIndexByCode(graphnodes,eachLink.toNodeCode);
                link.source = source;
                link.target =target;
                link.key = link.source + ',' + link.target;
                link.size = _.random(3, 5);
                return link;
            }).uniq((link) => link.key)
            .value();
        var kv = {};

        _.each(nodesFrom, function(d) {
            if (kv[d.key]) {
                // if the node already exists, maintain current position
                d.x = kv[d.key].x;
                d.y = kv[d.key].y;
            } else {
                // else assign it a random position near the center
                d.x = width * 5 + _.random(-150, 150);
                d.y = height * 2 + _.random(-25, 25);
            }
        });


        return {nodesFrom, linksFrom};
    }

    findIndexByCode = (graphnodes,byCode) =>{
       var index = _.findIndex(graphnodes,function(graphNode){
            return graphNode.code == byCode ;
       })
        return index;
    }


    randomData=(nodes, width, height)=>{
        var oldNodes = nodes;
        // generate some data randomly
        nodes = _.chain(_.range(_.random(3,6)))
            .map(function() {
                var node = {};
                node.key = _.random(0, 30);
                node.size = _.random(4, 10);

                return node;
            }).uniq(function(node) {
                return node.key;
            }).value();

        if (oldNodes) {
            var add = _.initial(oldNodes, _.random(0, oldNodes.length));
            add = _.rest(add, _.random(0, add.length));

            nodes = _.chain(nodes)
                .union(add).uniq((node)=> {
                    return node.key;
                }).value();
        }

        var links = _.chain(_.range(_.random(15, 35)))
            .map(()=> {
                var link = {};
                link.source = _.random(0, nodes.length - 1);
                link.target = _.random(0, nodes.length - 1);
                link.key = link.source + ',' + link.target;
                link.size = _.random(1, 3);

                return link;
            }).uniq((link) => link.key)
            .value();

        this.maintainNodePositions(oldNodes, nodes, width, height);

        return {nodes, links};
    }
    maintainNodePositions=(oldNodes, nodes, width, height)=> {
        var kv = {};
        _.each(oldNodes, function(d) {
            kv[d.key] = d;
        });
        _.each(nodes, function(d) {
            if (kv[d.key]) {
                // if the node already exists, maintain current position
                d.x = kv[d.key].x;
                d.y = kv[d.key].y;
            } else {
                // else assign it a random position near the center
                d.x = width / 2 + _.random(0, 300);
                d.y = height / 2 + _.random(0, 100);
            }
        });
    }

}

