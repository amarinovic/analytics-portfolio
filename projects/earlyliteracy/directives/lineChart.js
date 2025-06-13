/**
lineChart.js
**/

literacyApp.directive("lineChart", function(){
 
    function link(scope, element, attr){
        
        var data = [[0,1513324800],[100,378341600]];
        
        var minimumCost = 378341600,
            maximumCost = 1513324800,
            cost;
        
        var height = 250,
            width = 350,
            barWidth = 100;
        
        var xScale = d3.scale.linear()
                       .domain([0, 100])
                       .range([100, 335])
        
        var yScale = d3.scale.linear()
                       .domain([minimumCost, maximumCost])
                       .range([200, 10])
        
        var svg = d3.select(element[0])
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width)
                    .attr("id", "lineSvg");
    
        var group = svg.append("g")
                       .attr("transform", "translate(0,0)")
                       .attr("id", "lineGroup");
        
        var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(5)
                      .tickFormat(function(d) { return d + "%" });
        
        var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left") 
                      .ticks(5)
                      .tickFormat(function(d) { return "$" + d3.format(",")(d) });
        
        group.append("g")
             .attr("class", "xAxis axis")
             .attr("transform", "translate(0,200)")
    
        group.append("g")
             .attr("class", "yAxis axis")
             .attr("transform", "translate(" + xScale.range()[0] + ",0)")

        group.selectAll(".yAxis")
             .call(yAxis)

        group.selectAll(".xAxis")
             .call(xAxis)
        
        svg.append("text") 
           .attr("x", -105)
           .attr("y", 10)
           .attr("transform", "rotate(-90)")
           .style("text-anchor", "middle")
           .text("COST TO SOCIETY")
           .attr("class", "barLabel")
    
        svg.append("text") 
           .attr("x", 200)
           .attr("y", 235)
           .style("text-anchor", "middle")
           .text("3RD GRADE LITERACY")
           .attr("class", "barLabel")
        
        var generate = d3.svg.line()
                         .x(function(d) { return xScale(d[0]) })
                         .y(function(d) { return yScale(d[1]) });
        
        group.append("path")
             .datum(data)
             .attr("d", generate)
             .attr("stroke", "grey")
             .attr("stroke-width", 2)
             .attr("fill", "none")
        
        var trackerCircle = svg.append("circle")
                               .attr("r", 8)
                               .attr("fill", "#fdb713")
    
        var trackerY = svg.append("line")
                          .attr("y2", yScale.range()[0])
                          .attr("stroke", "#fdb713")
                          .attr("stroke-width", 2)
                          .style("stroke-dasharray", ("2, 3")) 
    
        var trackerX = svg.append("line")
                          .attr("x1", xScale.range()[0])
                          .attr("stroke", "#fdb713")
                          .attr("stroke-width", 2)
                          .style("stroke-dasharray", ("2, 3")) 
        
        scope.$watch("data", function(value){
            
            cost = scope["moneyLost"];
            
            trackerX.attr("y1", yScale(cost))
                    .attr("y2", yScale(cost))
                    .attr("x2", xScale(value))
    
            trackerY.attr("x1", xScale(value))
                    .attr("x2", xScale(value))
                    .attr("y1", yScale(cost))
    
            trackerCircle.attr("cx", xScale(value))
                         .attr("cy", yScale(cost))
            
        })
        
    }
    return {
        link: link,
        restrict: "E",
        scope: { data : '=',
                 moneyLost: '=' }
    }
    
})