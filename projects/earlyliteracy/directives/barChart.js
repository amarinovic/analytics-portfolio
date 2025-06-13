/*
barChart.js
*/

literacyApp.directive("barChart", function(){
 
    function link(scope, element, attr){
        
        var data = [{ "group": "notProficient" },
                    { "group": "proficient" }];
        
        var height = 235,
            width = 300,
            barWidth = 100;
        
        var colorScale = d3.scale.ordinal()
                                 .domain(["notProficient", "proficient"])
                                 .range(["#c4161c","#003663"]);
        
        var xScale = d3.scale.ordinal()
                       .domain([0, 1])
                       .range([70, 180])
        
        var yScale = d3.scale.linear()
                       .domain([0, 5820])
                       .range([200, 15])
        
        var svg = d3.select(element[0])
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width)
                    .attr("id", "barSvg");
    
        var group = svg.append("g")
                       .attr("transform", "translate(0,0)")
                       .attr("id", "barGroup");

        var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left") 
                      .ticks(5);

        group.append("g")
             .attr("class", "yAxis axis")
             .attr("transform", "translate(" + (xScale.range()[0] - 10) + ",0)")

        group.selectAll(".yAxis")
             .call(yAxis)
        
        appendBarChartLabels(svg, xScale, barWidth, data)
   
        var bars = group.selectAll("rect");
        
        scope.$watch("data", function(value){
            
            data[0]["notGraduating"] = scope["notProfNotGrad"];
            data[1]["notGraduating"] = scope["profNotGrad"];
            
            bars = bars.data(data)

            bars.enter().append("rect")
                .attr("fill", function(d){ return colorScale(d["group"]) })
                .attr("width", barWidth)
                .attr("x", function(d,i){ return xScale(i) })
            
            bars.attr("height", function(d){ return yScale.range()[0] - yScale(d["notGraduating"]) })
                .attr("y", function(d){ return yScale(d["notGraduating"]) })
            
            bars.exit().remove()
            
        })
        
    }
    return {
        link: link,
        restrict: "E",
        scope: { data : '=',
                 notProfNotGrad: '=',
                 profNotGrad: '=' }
    }
    
})

function appendBarChartLabels(svg, xScale, barWidth, data){
    
    svg.append("text") 
           .attr("x", -105)
           .attr("y", 15)
           .attr("transform", "rotate(-90)")
           .style("text-anchor", "middle")
           .text("STUDENTS NOT GRADUATING")
           .attr("class", "barLabel")
    
    svg.append("text") 
           .attr("x", function(){ return xScale(0) + (barWidth/2) })
           .attr("y", 215)
           .text("NOT READING")
           .style("text-anchor", "middle")
           .attr("class", "barLabel")
    
    svg.append("text") 
          .attr("x", function(){ return xScale(1) + (barWidth/2) })
          .attr("y", 215)
          .style("text-anchor", "middle")
          .text("READING")
          .attr("class", "barLabel")
       
    data.forEach(function(d, i){
        
        svg.append("text")
           .attr("x", function(){ return xScale(i) + (barWidth/2) })
           .attr("y", 225)
           .style("text-anchor", "middle")
           .text("PROFICIENTLY")
           .attr("class", "barLabel")
        
        
    })
    
}