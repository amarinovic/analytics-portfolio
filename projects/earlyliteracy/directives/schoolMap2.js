/*
schoolMap.js
*/

literacyApp.directive("schoolMap", function(){
 
    function link(scope, element, attr){
        
        var height = 500,
            width = 500;

        var rScale = d3.scale.sqrt()
                       .range([2, 20])

        var colorScale = d3.scale.linear()
                           .range(["#c4161c", "#003663"])
        
         d3.select("#schoolKey")
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
        
        scope.$watch("schoolData", function(schoolData){ if(schoolData){                                                         
            
            var schools = schoolData.data; 

            // Sort so that the smallest schools display on top.
            schools.sort(function(a,b){return d3.descending(a["gradeLevelNum"],b["gradeLevelNum"])})

            rScale.domain(d3.extent(schools, function(d){ return d["gradeLevelNum"] }))
            colorScale.domain(d3.extent(schools, function(d){ return d["literacyRate"] }))
            
            legend.scale(colorScale)
            console.log(legend)
            
            d3.select("#schoolKey")
              .select(".legend")
              .call(legend)
            

            d3.select(element[0]).attr("height", height).attr("width", width)
            var map = new google.maps.Map(d3.select(element[0]).node(),{
                zoom: 10,
                // Center the map around Dallas city center coordinates.
                center: new google.maps.LatLng(32.7830600, -96.8066700),
                mapTypeId: google.maps.MapTypeId.TERRAIN,
            }); 
            
    
            // Initalize an overlay on which to plot site points.
            var overlay = new google.maps.OverlayView();

            overlay.onAdd = function(){

                var layer = d3.select(this.getPanes().overlayMouseTarget)
                              .append("div")
                              .attr("class", "schools");

                // Draw each school as a separate SVG element.
                overlay.draw = function(){

                    var projection = this.getProjection();

                    var padding = 2;

                    var tip = d3.tip()
                                .attr("class", "d3-tip")
                                .html(function(d){ return d["name"] + "<br><b>" + d3.format(".01f")(d["literacyRate"]*100) + "%</b>" })

                    var schoolBubble = layer.selectAll(".schoolSvg")
                                            .data(schools)
                                            .each(transform)
                                            .enter()
                                            .append("svg")
                                            .attr("height", function(d) { return 2*rScale(d["gradeLevelNum"]) + 2*padding }) 
                                            .attr("width", function(d){ return 2*rScale(d["gradeLevelNum"]) + 2*padding })           
                                            .each(transform)
                                            .attr("class", "schoolSvg")

                    schoolBubble.append("circle") 
                                .attr("r", function(d){return rScale(d["gradeLevelNum"]) })
                                .attr("cx", function(d){return padding + rScale(d["gradeLevelNum"])})
                                .attr("cy", function(d){ return padding + rScale(d["gradeLevelNum"]) })
                                .attr("fill", function(d) {return colorScale(d["literacyRate"]) }) 
                                .attr("stroke", "white")
                                .attr("stroke-weight", 2)
                                .attr("class", "schoolBubble")
                                .on("mousemove", tip.show)
                                .on("mouseover", function(d){ adjustTip(schoolBubble, tip) })
                                .on("mouseout", tip.hide)

                    // Function to position the points on the map.
                    function transform(d) {
                        d = new google.maps.LatLng(d["latitude"], d["longitude"]);
                        d = projection.fromLatLngToDivPixel(d);

                        return d3.select(this)
                                 .style("left", (d.x - padding) + "px")
                                 .style("top", (d.y - padding) + "px");
                    }

                    function adjustTip(bubble, tooltip){
                        return bubble.call(tooltip)
                    }
                }

            }   
        
            // Bind overlay to the map.
            overlay.setMap(map);  
            
        }})
        
    }
    return {
        link: link,
        restrict: "E",
        scope: { 
            schoolData: "="
        }
    }
    
})