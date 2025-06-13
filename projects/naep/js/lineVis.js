/**
Create LineVis object and define global variables.
**/
LineVis = function(div){
    
    // Assign to DOM element.
    this.element = div;
    
    // Dimensions.
    this.height = 375;
    this.width = 550;
    
    // To hold wrangled data.
    this.displayData = [];
    
    // Key to access data for each series.
    this.series = ["averageScore", "frlScore", "ellScore", "asianScore", "blackScore", "hispanicScore", "whiteScore"];
    var that = this;

    this.preInitializeVis();
    this.initializeVis();
    
}

/** 
Initialize the LineVis layout.
**/
LineVis.prototype.preInitializeVis = function(){ 
    
    var that = this;
    
    // Initialize svg.
    this.svg = this.element.append("svg")
                           .attr("width", this.width)
                           .attr("height", this.height)
                           .attr("class", "svgLine")
    
    this.yearScale = d3.scale.ordinal()
    
    this.xScale = d3.scale.linear()
                          .range([50,525])
    
    this.yScale = d3.scale.linear()
                          .range([350,25])
    
    // Initialize axes.
    this.xAxis = d3.svg.axis()
                       .scale(that.xScale)
                       .orient("bottom")

    this.yAxis = d3.svg.axis()
                      .scale(that.yScale)
                      .orient("left") 
    
    this.svg.append("g")
            .attr("class", "yAxis axis")
            .attr("transform", "translate(50,0)")
    
    this.svg.append("g")
            .attr("class", "xAxis axis")
            .attr("transform", "translate(0,350)")
    
    // Y axis label.
    this.svg.append("text") 
             .attr("x", -200)
             .attr("y", 15)
             .attr("transform", "rotate(-90)")
             .attr("fill", "grey")
             .style("text-anchor", "middle")
             .text("SCORE")
    
    // Initialize tooltip.
    this.tip =  d3.tip()
                  .attr("class", "d3-tip")
                  .style("font-weight", "normal")
                  .style("text-align", "left")
                  .html(function(d,i){return d[i]})
    
    // Dotted line to mark selected year.
    this.tracker = this.svg.append("line")
                           .attr("y1", 25)
                           .attr("y2", 350)
                           .attr("stroke", "grey")
                           .attr("stroke-width", 1)
                           .style("stroke-dasharray", ("2, 3")) 
    
    // Create path element for each group for both the nation and for a selected state.
    this.series.forEach(function(series){
        
        that.svg.append("path")
                .attr("fill", "none")
                .attr("stroke", function(){ return groupColorScale(series)}) 
                .attr("stroke-width", 1)
                .style("stroke-dasharray", ("10, 5")) 
                .attr("class", function(){return "nationPath " + series})
        
        that.svg.append("path")
                .attr("fill", "none")
                .attr("stroke", function(){ return groupColorScale(series)}) 
                .attr("stroke-width", 3)
                .attr("class", function(){return "statePath " + series})
    })
    
}

/**
Adjustmenets that are made only when a new dataset is selected.
**/
LineVis.prototype.initializeVis = function(){ 

    var that = this; 
    
    // Update scales with the new dataset stats.
    this.yearScale.domain(yearScaleDomain())
                  .range(yearScaleRange());
    
    this.xScale.domain([0,maxYear()]);
    
    this.yScale.domain(yScaleDomain());

    // Update the axes.    
    this.svg.selectAll(".xAxis")
            .transition()
            .duration(750)
            .call(this.xAxis)
    
    this.svg.selectAll(".xAxis")
            .selectAll("text")
            .text(function(d){return that.yearScale(d)})
            .attr("transform", "rotate(-45)")
            .attr("dy", 5)
            .style("text-anchor", "end")
            .style("font-weight", function(d,i){ return (i == YEAR) ? "bold" : "normal" })
    
    this.svg.selectAll(".yAxis")
            .transition()
            .duration(750)
            .call(this.yAxis)
    
    // Update position of dotted line.
    this.tracker.attr("x1", that.xScale(YEAR))
                .attr("x2", that.xScale(YEAR))
                        
    // Plot national data.
    this.wrangleData("nation", 0);
    this.updateVisNational();

}

/**
Wrangle the selected dataset.
**/
LineVis.prototype.wrangleData = function(jurisdictionType, index){
    
    var that = this;
    
    var nestedData = nest();
    
    var nestedData2 = nestedData[jurisdictionScale(jurisdictionType)]["values"];  

    this.displayData = [];
    var max = maxYear(DATASET);
    for (i = 0; i <= max; i++){
        
        var entry = [i, +nestedData2[index]["values"][i]["values"][0]["averageScore"],
                        +nestedData2[index]["values"][i]["values"][0]["frlScore"],
                        +nestedData2[index]["values"][i]["values"][0]["ellScore"],
                        +nestedData2[index]["values"][i]["values"][0]["asianScore"],
                        +nestedData2[index]["values"][i]["values"][0]["blackScore"],
                        +nestedData2[index]["values"][i]["values"][0]["hispanicScore"],
                        +nestedData2[index]["values"][i]["values"][0]["whiteScore"]];
        
        that.displayData.push(entry)
    }
    
}

/**
Update the visualization with the wrangled data.
**/
LineVis.prototype.updateVisNational = function(){
    
    var that = this;

    this.series.forEach(function(series, i){

        // Function for path element.
        var line = d3.svg.line()
                     .x(function(d) { return that.xScale(d[0]) })
                     .y(function(d) { return that.yScale(d[i+1]) }) 
                     .defined(function(d) { return !isNaN(d[i+1]); })
                     .interpolate("linear");

        // Append line chart.
        that.svg.selectAll("path.nationPath." + series)
                .transition().duration(750)
                .attr("d", line(that.displayData))
        
        // Append points for scatterplot.
        var point = that.svg.selectAll("circle.nationCircle." + series)
                            .data(that.displayData)
        
        point.exit().remove()
        
        point.enter()
             .append("circle")
             .attr("r", 4)
             .attr("class", function(){return series + " emphasize nationCircle"})
        
        point.attr("fill", function(d){ return (!isNaN(d[i+1])) ? groupColorScale(series) : "none" })
             .transition().duration(750).ease("linear")
             .attr("cx", function(d){ if(!isNaN(d[0])){ return that.xScale(d[0]) } })
             .attr("cy", function(d){ if(!isNaN(d[i+1])){ return that.yScale(d[i+1]) } })
        
       point.on("mouseover", function(d){ that.tip.show(d, SERIES.indexOf(series)+1) })
             .on("mouseout", that.tip.hide)

    })
    
    this.svg.call(that.tip)
    
}

/**
Update the visualization with the wrangled data.
**/
LineVis.prototype.updateVis = function(){
    
    var that = this;

    this.series.forEach(function(series, i){

        // Function for path element.
        var line = d3.svg.line()
                         .x(function(d) { return that.xScale(d[0]) })
                         .y(function(d) { return that.yScale(d[i+1]) }) 
                         .defined(function(d) { return !isNaN(d[i+1]); })
                         .interpolate("linear")

        // Update line with new  line to line chart.
        that.svg.selectAll("path.statePath." + series)
                .transition().duration(750)
                .attr("d", line(that.displayData))
            
        
        // Append points for scatterplot.
        var point = that.svg
                        .selectAll("circle.stateCircle." + series)
                        .data(that.displayData)
        
        point.exit().remove()
        
        point.enter()
             .append("circle")
             .attr("r", 4)
             .attr("class", function(){return series + " emphasize stateCircle"})
        
        point.attr("fill", function(d){ return (!isNaN(d[i+1])) ? groupColorScale(series) : "none" })
             .transition().duration(750).ease("linear")
             .attr("cx", function(d){ if (!isNaN(d[0]))return that.xScale(d[0])} )
             .attr("cy", function(d){ if (!isNaN(d[i+1])) return that.yScale(d[i+1])} )
        
        point.on("mouseover", function(d){ that.tip.show(d, SERIES.indexOf(series)+1) })
             .on("mouseout", that.tip.hide)
            
    })
    
    filterLine();
    
    this.svg.call(that.tip)
    
}

LineVis.prototype.onSelectionChange = function(){
    
    var that = this;
    
    if(SELECTED!=null){
        if (TYPE == "state"){ this.wrangleData("state", indexByStateName[SELECTED]) }
        else { this.wrangleData("city", indexByCityName[SELECTED]) }
    }
    else { this.displayData = []; }
    
    this.updateVis();
    
    if(FIRST){
        d3.selectAll(".filterCheckbox").each(function(){if(this.value != "averageScore"){ this.checked = false}})
        filterLine()
        FIRST = false;
    }
    
}

function yearScaleDomain(){
    
    if (DATASET == DATASETS["MATH4"] || DATASET == DATASETS["MATH8"])
        return [0,1,2,3,4,5,6,7,8,9];
    else if (DATASET == DATASETS["READ4"])
        return [0,1,2,3,4,5,6,7,8,9,10];
    else if (DATASET == DATASETS["READ8"])
        return [0,1,2,3,4,5,6,7];
}

function yearScaleRange(){
    
    if (DATASET == DATASETS["MATH4"] || DATASET == DATASETS["MATH8"])
        return [1990,1992,1996,2000,2003,2005,2007,2009,2011,2013];
    else if (DATASET == DATASETS["READ4"])
        return [1992,1994, 1996,1998,2000,2003,2005,2007,2009,2011,2013];
    else if (DATASET == DATASETS["READ8"])    
        return [1998,2002,2003,2005,2007, 2009, 2011,2013];
}
