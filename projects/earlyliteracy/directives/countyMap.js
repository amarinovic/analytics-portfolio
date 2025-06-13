/*
countyMap.js
*/

literacyApp.directive("countyMap", function(){
 
    function link(scope, element, attr){
        
        scope.$watch("geoData", function (geoData) {
            if (geoData) {
                drawMap(geoData);
                if (!scope.loaded && scope.valueData) {
                    updateMap(scope.valueData)
                }
            }
        })
       
        scope.$watch("valueData", function (valueData) {
            if (valueData != null && scope.geoData != null) {
                updateMap(valueData)
                scope.loaded = true;
            }
        })
        
        var height = 500,
            width = 500;
        
        var counties,
            selected,
            zoomFactor;

        var colorScale = d3.scale.linear()
                           .domain([0,1])
                           .range(["#c4161c", "#003663"])
        
        var svg = d3.select(element[0])
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width)
                    .attr("id", "countyMapSvg");
    
        var countyLayer = svg.append("g")
                             .attr("transform", "translate(0,0)")
                             .attr("id", "countyLayer");

        var outlineLayer = svg.append("g")
                              .attr("id", "outlineLayer")
                              .attr("transform", "translate(0,0)");
    
        var projection = d3.geo.albersUsa()
                           .scale(2500)
                           .translate([375, -50]);

        var path = d3.geo.path()
                         .projection(projection);         
        
        var tip = d3.tip()
                    .attr("class", "d3-tip")
                    .html(function(d) { 
                        if(!isNaN(d["properties"]["literacyRate"])){
                            return d["properties"]["name"] + " County" + "<br><b>" +
                            d3.format(".01f")(d["properties"]["literacyRate"]*100) + "%</b>" 
                        }
                        else{ return d["properties"]["name"] + " County" }
                    });
        
        svg.call(tip)
        
        d3.select("#countyKey")
          .append("g")
          .attr("class", "legend")
          .attr("transform", "translate(5,15)");
        
        // Style the legend.
        var legend = d3.legend.color()
                       .orient("horizontal")
                       .cells(10)
                       .shapePadding(5)
                       .shapeHeight(15)
                       .shapeWidth(15)
                       .labels([" ", " "," "," "," "," "," "," "," "," ",])
        
        function drawMap(geoData){
            
            counties = geoData.data.features;
            
            counties.forEach(function(county){
            
                // Create a path element for each county.
                countyLayer.append("path")
                           .attr("class", function(){return "countyArea " + county["properties"]["name"].replace(/\s/g, '')}) 

                // Create and outline for each county.
                outlineLayer.append("path")
                            .attr("class", "countyOutline")
            
            })
            
            countyLayer.selectAll(".countyArea")
                       .data(counties)
                       .attr("d", path)
                       .attr("fill", "white")
            
            outlineLayer.selectAll("path.countyOutline")
                        .data(counties)
                        .attr("d", path)
                        .attr("stroke", "white")
            
        }
        
        function updateMap(valueData){
            
            counties.forEach(function(county){
                
                if (valueData.data[county["properties"]["name"]] != null){
                    county["properties"]["literacyRate"] = +valueData.data[county["properties"]["name"]]["percent"];
                }
                
            })
            
            countyLayer.selectAll(".countyArea")
                       .data(counties)
                       .attr("fill", function(d){ return (!isNaN(d["properties"]["literacyRate"])) ? colorScale(d["properties"]["literacyRate"]) : "grey" })
            
            countyLayer.selectAll(".countyArea")
                       .on("mouseover", function(d){ if(zoomFactor == 1){ tip.show(d) } })
                       .on("mouseout", tip.hide)
                       .on("click", zoom)
            
            legend.scale(colorScale)
            
            d3.select("#countyKey")
              .select(".legend")
              .call(legend)
            
        }
        
        function zoom(d){
            
            var x, 
                y; 

            // If d is not null, and the selected is not the same as the previously selected.
            if (d && selected !== d) {
                var centroid = path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                zoomFactor = 8;
                selected = d;
            } 
            // Otherwise, zoom out.
            else {
                x = width / 2;
                y = height / 2;
                zoomFactor = 1;
                selected = null;
            }

            d3.select("#countyLayer").selectAll("path")
                       .classed("active", selected && function(d) { return d === selected; });

            d3.select("#countyLayer").transition()
                       .duration(750)
                       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomFactor + ")translate(" + -x + "," + -y + ")")

            d3.select("#outlineLayer").transition().duration(750)
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomFactor + ")translate(" + -x + "," + -y + ")")
                        .selectAll(".countyOutline").attr("stroke", function(){ return (zoomFactor == 1) ? "white" : "lightgrey" })
                        .attr("stroke-width", function(){ return (zoomFactor == 1) ? 1 : .1 })
    
            if(zoomFactor != 1){

                d3.select("#countyLayer").selectAll(".countyLabel")
                           .data(counties)
                           .enter()
                           .append("text")
                           .text(function(d){ return d["properties"]["name"] })
                           .attr("x", function(d){ return path.centroid(d)[0] })
                           .attr("y", function(d){ return  path.centroid(d)[1] })
                           .attr("text-anchor","middle")
                           .attr("class", "countyLabel")

                d3.select("#countyLayer").selectAll(".countyPercent")
                           .data(counties)
                           .enter()
                           .append("text")
                           .text(function(d){ 
                                if(!isNaN(d["properties"]["literacyRate"])){
                                    return d3.format(".01f")(d["properties"]["literacyRate"]*100) + "%"
                                }
                            })
                           .attr("x", function(d){ return path.centroid(d)[0] })
                           .attr("y", function(d){ return  path.centroid(d)[1] + 4 })
                           .attr("text-anchor","middle")
                           .attr("class", "countyPercent")
                
            }
            else{
                d3.select("#countyLayer").selectAll(".countyLabel").remove()
                d3.select("#countyLayer").selectAll(".countyPercent").remove()
            }
            
        }
        
        d3.select("#zoomButton").on("click", zoomToDallas);
        function zoomToDallas(){

            var dallas = d3.select("#countyLayer").selectAll("path.Dallas")[0][0]["__data__"]
            zoom(dallas)
    
        }
        
    }
    return {
        link: link,
        restrict: "E",
        scope: {
            geoData: "=",
            valueData: "=",
        }
    }
    
})