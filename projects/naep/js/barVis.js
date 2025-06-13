/**
Create object and define global variables.
**/
BarVis = function(div){
    
    // Assign to DOM element.
    this.element = div;
    
    // Dimensions.
    this.height = 375;
    this.width = 550;
    
    // To hold wrangled data.
    this.displayData = [];

    this.initializeVis();
    
}

/**
Initialize the layout.
**/
BarVis.prototype.initializeVis = function(){ 

    var that = this; 
    
    // Initialize svg.
    this.svg = this.element.append("svg")
                           .attr("width", that.width)
                           .attr("height", that.height)
                           .attr("class", "svgBars")
    
    // Initalize scales.
    
    // Initialize scale for positioning entire groups.
    this.xGroupScale = d3.scale.ordinal()
                               .rangeRoundBands([50, 525], .2);

    // Initialize scale for positioning individual bars within each group.
    this.xBarScale = d3.scale.ordinal();

    this.yScale = d3.scale.linear()
                    .range([350, 25]);
    
    // Initalize color scale.
    this.colorScale = d3.scale.linear()
    
    // Initialize and append axes.
    
    this.xAxis = d3.svg.axis()
                       .scale(that.xGroupScale)
                       .orient("bottom")

    this.yAxis = d3.svg.axis()
                      .scale(that.yScale)
                      .orient("left") 
    
    this.svg.append("g")
            .attr("class", "yAxis axis")
            .attr("transform", "translate(50,0)")
    
    this.svg.append("g")
            .attr("class", "xAxis axis")
            .attr("transform", "translate(0,355)")
        // Y axis label.
    this.svg.append("text") 
             .attr("x", -200)
             .attr("y", 15)
             .attr("transform", "rotate(-90)")
             .attr("fill", "grey")
             .style("text-anchor", "middle")
             .text("SCORE")
    
    // Initialize tooltip.
    this.tip = d3.tip()
 				 .attr("class", "d3-tip")
 				 .style("font-weight", "normal")
                 .style("text-align", "left")
 				 .html(function(d, name){ 
                    if(!d3.selectAll(".nationalBars").empty()){
                        return d["name"] + "<br>" + d["value"] + "<br>" + calculatePoints(d["value"],name) }
                    else { return d["name"] + "<br>" + d["value"] }
                 })

    this.wrangleData();

    this.updateVis();
}

function calculatePoints(value, name){
    var nationalValue = d3.selectAll(".nationalBars")[0][groupNameScale.domain().indexOf(name)]["__data__"][1]
    var difference = value - nationalValue;
    if (difference == 0){ return "Same as<br>national average" }
    else if(Math.abs(difference) == 1){ return (difference > 0) ? difference + " point above<br>national average" : (difference * -1)+ " point below<br>national average" }
    else{ return (difference > 0) ? difference + " points above<br>national average" : (difference * -1)+ " points below<br>national average" }
}

/**
Wrangle the selected dataset.
**/
BarVis.prototype.wrangleData= function(){
    
    var that = this;
    
    var nestedData = nest();
    
    this.displayData = [];
    
    SERIES.forEach(function(series){
        
        var entry = [series];
        if(SELECTEDARRAY[0]){
            SELECTEDARRAY.forEach(function(select){
                if(select[1] == "state" ){
                    entry.push(+nestedData[jurisdictionScale("state")]["values"][indexByStateName[select[0]]]["values"][YEAR]["values"][0][series]);
                }
                else{
                    entry.push(+nestedData[jurisdictionScale("city")]["values"][indexByCityName[select[0]]]["values"][YEAR]["values"][0][series]);
                } 
            })
        }
        
        that.displayData.push(entry);
    })
    

    this.displayData.forEach(function(d){
        d.values = SELECTEDARRAY.map(function(select, i){
            return {name: select[0], value: d[i + 1]}
        })
    })


}

/**
Update the visualization with the wrangled data.
**/
BarVis.prototype.updateVis = function(){
    
    var that = this;

    // Update scales.
    this.xGroupScale.domain(this.displayData.map(function(d) { return d[0]; }));
    var barDomain = [];
    SELECTEDARRAY.forEach(function(item){ barDomain.push(item[0]) })
    this.xBarScale.domain(barDomain)
                  .rangeRoundBands([0, that.xGroupScale.rangeBand()]);
    this.yScale.domain(yScaleDomain());
    this.colorScale.domain(yScaleDomain());
    
    // Update the axes.  
    
    this.svg.selectAll(".xAxis")
            .call(this.xAxis)
            .selectAll("text")
            .text(function(d){ return groupNameScale(d) })
    
    this.svg.selectAll(".yAxis")
            .transition()
            .duration(750)
            .call(this.yAxis)

    // Create and update a groupe element for each series.
    var barGroups = this.svg.selectAll(".barGroup")
                            .data(this.displayData)
                            
    barGroups.enter()
             .append("g")
             .attr("class", function(d){ return "barGroup " + d[0] })
             .attr("transform", function(d,i) { return "translate(" + that.xGroupScale(d[0]) + ",0)"; })

    // Enter, update, exit bars for each state in the selection.
    var bars = barGroups.selectAll("rect")
                        .data(function(d) { return d.values; })

    bars.enter()
        .append("rect")
        .attr("fill", "white")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("y",350)
        .attr("height", 0)
    
    // view the enter selection -- remove this!!
    console.log(bars)

    bars.attr("width", that.xBarScale.rangeBand())
        .attr("x", function(d) { return that.xBarScale(d.name); })
    
    bars.transition().duration(750).ease("linear")
        .attr("y", function(d) { return (!isNaN(d["value"])) ? that.yScale(d["value"]) : 350 })
        .attr("height", function(d) { return (!isNaN(d["value"])) ? 350 - that.yScale(d.value) : 0 })
        .attr("fill", function(d) { 
            var parentGroup = d3.select(this.parentElement);
            that.colorScale.range(["lightgrey", groupColorScale(parentGroup[0][0].classList[1])]); 
            return (!isNaN(d["value"])) ? that.colorScale(d["value"]) : "white" 
        }) 

    // When hovering over the bars.
    bars.on("mouseover", function(d){
            // Move to end of the group element so that it becomes the topmost element.
            $(this).appendTo(this.parentNode)
            d3.select(this).attr("stroke", "black")
            if(d["value"]){ that.tip.show(d,this.parentNode.classList[1]) }
        })
        .on("mouseout", function(d){
            d3.select(this).attr("stroke", "white")
            if(d["value"]){ that.tip.hide(d) }
        })
    
    // Remove bars that are no longer in the selection.
    bars.exit().remove()

    // LABELS
        
    var labels = barGroups.selectAll(".labelText")
                          .data(function(d){ return d["values"]})
    
    labels.enter()
          .append("text")
          .attr("text-anchor", "middle")
          .attr("class", "labelText")
          .attr("y", 350)
        
    labels.attr("x", function(d) { return that.xBarScale(d.name) + (that.xBarScale.rangeBand()/2) })
    
    labels.transition().duration(750).ease("linear")
          .attr("y", function(d) { return (!isNaN(d["value"])) ? that.yScale(d["value"]) - 2 : 350 })
          .text(function(d){ return (CITYNAMES.indexOf(d.name) < 0) ? stateInitialScale(d["name"]) : cityInitialScale(d.name) })
    
    labels.exit().remove()

    this.svg.call(this.tip);

}

BarVis.prototype.updateVisNational = function(){
    
    var that = this;
    
    // Wrangle the national data.
    var nestedData = nest();
    this.displayDataNational = [];
    
    SERIES.forEach(function(series){
        var entry = [series];
        entry.push(+nestedData[jurisdictionScale("nation")]["values"][0]["values"][YEAR]["values"][0][series]);
        that.displayDataNational.push(entry);
    })  
    
    // Update scales.
    this.xGroupScale.domain(this.displayData.map(function(d) { return d[0]; }));
    this.yScale.domain(yScaleDomain());
    this.colorScale.domain(yScaleDomain());
    
    var tip =  d3.tip()
                  .attr("class", "d3-tip")
                  .style("font-weight", "normal")
                  .style("text-align", "center")
                  .html(function(d){ return "National Average<br>" + d[1] })
    
    // Display on bar chart.
    
    // Create and update a group element for each series.
    
    var nationalBars = this.svg.selectAll(".nationalBars")
                               .data(this.displayDataNational)
    
    nationalBars.enter()
                .append("rect")
                .attr("class", "nationalBars")
                .attr("y", 350)
                .attr("height", 0)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3)
                .style("stroke-dasharray", ("1, 5")) 
                .style("stroke-linecap", "round")
                .attr("x", function(d) { return that.xGroupScale(d[0]); })
                .attr("width", 50)
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
    
    nationalBars.transition().duration(750)
                .attr("height", function(d) { return (!isNaN(d[1])) ? 350 - that.yScale(d[1]) : 0 })
                .attr("y", function(d) { return (!isNaN(d[1])) ? that.yScale(d[1]) : 350 })
    
    nationalBars.exit().remove()
    
    this.svg.call(tip)
    
}

BarVis.prototype.onSelectionChange = function(){
    
    var that = this;
    this.wrangleData();
    this.updateVis();
    
}

BarVis.prototype.removeNationalBars = function(){
    
    this.svg.selectAll(".nationalBars")
            .transition().duration(750)
            .attr("y", 350)
            .attr("height", 0)
            .remove()
    
}
