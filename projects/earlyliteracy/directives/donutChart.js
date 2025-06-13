/*
donutChart.js
*/

literacyApp.directive("donutChart", function(){
 
    function link(scope, element, attr){
        
        var data = [{ "group": "notProficient" },
                    { "group": "proficient" }];
        
        var colorScale = d3.scale.ordinal()
                                 .domain(["notProficient", "proficient"])
                                 .range(["#c4161c","#003663"]);

        var diameter = 350,
            radius = 175;
        
        var svg = d3.select(element[0])
                    .append("svg")
                    .attr("height", diameter)
                    .attr("width", diameter)
                    .attr("id", "donutSvg");
    
        var group = svg.append("g")
                       .attr("transform", "translate(" + (diameter/2) + "," + ((diameter/2)) + ")")
                       .attr("id", "donutGroup");

        var arc = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(140);

        var generate = d3.layout.pie()
                                .sort(null)
                                .value(function(d) { return d["percent"] });
   
        var arcs = group.selectAll("path");
        
        scope.$watch("data", function(value){

            data[0]["percent"] = 100 - value;
            data[1]["percent"] = +value;
            
            arcs = arcs.data(generate(data))

            arcs.enter().append("path")
            
            arcs.attr("d", arc)
                .style("fill", function(d){ return colorScale(d["data"]["group"]) })
                .attr("stroke", "white")
                .attr("stroke-width", 2)
            
            arcs.exit().remove()
            
        })
        
    }
    return {
        link: link,
        restrict: "E",
        scope: { data : '=' }
    }
    
})