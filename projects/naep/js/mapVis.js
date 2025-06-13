/****************************

    mapVis.js
    Prototype for MapVis object.
    
****************************/

/**
Create the object and define global variables.
**/
MapVis = function(div, eventHandler){
    
    // Assign to DOM element.
    this.element = div;
    
    // Pass event handler.
    this.eventHandler = eventHandler;
    
    // Dimensions.
    this.height = 375;
    this.width = 550;
    
    // To hold wrangled data.
    this.displayStateData = [];
    this.displayCityData = [];

    this.initializeVis()
    
}

/**
Initialize the layout.
**/
MapVis.prototype.initializeVis = function(){ 

    var that = this; 
    
    // Define map projection.
    this.projection = d3.geo.albersUsa()
                            .translate([(that.width)/2,(that.height)/2])
                            .scale([650]);
			
    // Define path generator.
    this.path = d3.geo.path()
				      .projection(that.projection);
    
    // Initialize svg.
    this.svg = this.element.append("svg")
                           .attr("width", that.width)
                           .attr("height", that.height)
                           .attr("class", "svgMap")
    
    // Create layers for appending elements.
    
    // For default state path elements. 
    this.svg.append("g").attr("id","stateLayer")
    // For state outlines. 
    this.svg.append("g").attr("id","outlineLayer")
    // For states that do not have a value, in order to better display the outline.
    this.svg.append("g").attr("id","valuelessLayer")
    // For selected state(s).
    this.svg.append("g").attr("id","selectedLayer")
    // For cities.
    this.svg.append("g").attr("id","cityLayer")
    
    // Create a path element for each state.
    STATES.features.forEach(function(state){
        that.svg.select("#stateLayer")
                .append("path")
                .attr("class", function(){return "stateArea " + state["properties"]["name"].replace(/\s/g, '') })
                .attr("fill", "white")
    })
    
    // Update each state path with data for each state.
    this.state = that.svg.selectAll("path.stateArea")
                         .data(STATES.features)
                         .attr("d", that.path)
    
    // Create a contiguous border on top of the state path elements.
  	this.svg.select("#outlineLayer")
            .append("path")
            .datum(topojson.mesh(STATEOUTLINES, STATEOUTLINES.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "outline")
            .attr("d", that.path)
    
    // Initialize the legend.
    d3.select("#legendSvg").append("g")
            .attr("class", "legend")
            .attr("transform", "translate(1,10)");

    // Style the legend.
    this.legend = d3.legend.color()
                           .orient("horizontal")
                           .shapePadding(4)
                           .shapeHeight(10)
                           .labels([" ", " "," "," "," "," "," "," "," "," ",])
    
    // Initialize tooltip.
    this.tip =  d3.tip()
                  .attr("class", "d3-tip")
                  .style("font-weight", "normal")
                  .style("text-align", "left")
                  .html(function(d, type){
                        // If the element is a state path...
                        if (type == "path"){
                            // If the data exists, display the state name, score, and rank.
                            if(!isNaN(d["properties"]["value"])){
                                return d["properties"]["name"] + "<br>" +
                                d["properties"]["value"] + "<br>" + 
                                rank(d["properties"]["name"])[0] + " out of " + rank(d["properties"]["name"])[1]
                            }
                            // Otherwise only display the state name.
                            else { return d["properties"]["name"] }
                        }
                        // Otherwise it is a city.
                        else { return (!isNaN(d["value"])) ? d["city"] + "<br>" + d["value"] : d["city"] }
                    })
                 
    // Add data and update layout.
    this.wrangleData()
    this.updateVis()

}

/**
Wrangle the selected dataset.
**/
MapVis.prototype.wrangleData= function(){

    var nestedData = nest();
    
    this.displayStateData = nestedData[jurisdictionScale("state")]["values"];  
    this.displayCityData = nestedData[jurisdictionScale("city")]["values"];  

}

/**
Update the visualization with the wrangled data.
**/
MapVis.prototype.updateVis = function(){
    
    var that = this;
    
    this.colorScale = this.getColorScale();
    
    // Update the legend.
    this.legend.scale(that.colorScale)
    d3.select("#legendSvg").select(".legend").call(that.legend)

    // Set mouseover event for legend swatches.
    d3.select("#legendSvg").selectAll(".swatch")
                           .on("mouseover", function(d){
                                var elements = d3.selectAll(".c" + d.split("#").pop()).attr("stroke", "black");
                                elements[0].forEach(function(elem){ 
                                    if(elem.tagName == "path"){ document.getElementById("selectedLayer").appendChild(elem) }
                                })
                            })
                            .on("mouseout", function(){ that.updateOutlines() })

    // STATES.
    
    // Assign data to each state.
    this.displayStateData.forEach(function(state, i){
        
        // Store state name.
        var stateName = state["key"];
        
        // Grab data value, and convert from string to number.
        var stateValue = +state["values"][YEAR]["values"][0][GROUP];
        
        // Find the corresponding state inside the GeoJSON and assign data once state is found.
        for (var j = 0; j < STATES.features.length; j++) {
            
            var jsonState = STATES.features[j].properties.name;
            
			if (stateName == jsonState) {
				STATES.features[j].properties.value = stateValue;
				break;
            }
            
		}
        
    })
    
    // Update each state path with data for each state.
    this.state.data(STATES.features)
    
    // Update attributes for each state path.
    this.state.attr("class", function(d){ 
                    var color;
                    if(d["properties"]["value"]){ color = that.colorScale(d["properties"]["value"]).split("#").pop() }
                    return "stateArea pointer c" + color + " " + d["properties"]["name"].replace(/\s/g, '') 
              })
              .attr("stroke", function(d) { return (d["properties"]["value"]) ? "none" : that.valueless(this, groupColorScale(GROUP)) })
         
    // Transition the fill color.
    this.state.transition().duration(750).ease("linear")
		      .attr("fill", function(d){ return (d["properties"]["value"]) ? that.colorScale(d["properties"]["value"]) : "white" })
    
    // User tasks for state paths.
    this.state.on("mouseover", function(d){
                    that.tip.show(d, this.tagName)
                    that.moveToSelectedLayer(d, this);
              })
              .on("mouseout", function(d){
                    that.tip.hide(d, this.tagName)
                    that.removeFromSelectedLayer(d, this);
              })
              .on("click", function(d){ 
                    TYPE = "state";
                    that.updateGlobals(d);
                    // Update the line and bar charts with the selection(s).
                    $(that.eventHandler).trigger("selectionChanged", d["properties"]["name"]);
                    that.updateOutlines();
              })
    
    // CITIES.
			
    // Assign data to each city.
    this.displayCityData.forEach(function(city, i){
        
        // Store city name.
        var cityName = city["key"];
        
        // Grab data value, and convert from string to number.
        var cityValue = +city["values"][YEAR]["values"][0][GROUP];
        
        // Find the corresponding city inside the json.
        for (var j = 0; j < CITIES.length; j++) {
            
            var jsonCity = CITIES[j]["city"];
				
			if (cityName == jsonCity) {
						
                // Copy the data value into the JSON
				CITIES[j].value = cityValue;
				break;
            }
		}
    
    })
    
    // add circles to svg
    var city = this.svg.select("#cityLayer")
                        .selectAll("circle")
		                .data(CITIES)
    
    city.enter()
		.append("circle")
        .attr("r", 10)

    city.attr("cx", function (d) { return that.projection([d.longitude, d.latitude])[0];; })
		.attr("cy", function (d) { return that.projection([d.longitude, d.latitude])[1];; })
        .attr("stroke", function(d) { return (d["value"]) ? "white" : "none" })
        .attr("stroke-width", 1)  
        .attr("fill", function(d) { return (d["value"]) ? that.colorScale(d["value"]) : "none" })  
        .attr("class", function(d){ 
                    var color;
                    if(d["value"]){ color = that.colorScale(d["value"]).split("#").pop() }
                    return "emphasize pointer c" + color + " " + ((d["city"].replace(/\s/g, '')).replace('(', '')).replace(')', '') 
        })
    
    city.on("mouseover", that.tip.show)
        .on("mouseout", that.tip.hide)
        .on("click", function(d){ 
                TYPE = "city";
                that.updateGlobals(d)
                // Update the line chart with the selected state.
                $(that.eventHandler).trigger("selectionChanged", d["city"])  
                that.updateOutlines()
        })
    
    city.exit().remove()
       
    // Bind tooltips to svg.
    this.svg.call(this.tip);
    
}

/**
Update global variables depending on user selection.
**/
MapVis.prototype.updateGlobals = function(e){

    // Update global array for bar chart.
    if (isBarActive()){
        var abc = [];
        SELECTEDARRAY.forEach(function(item){abc.push(item[0])})
        var selectedIndex;
        if(e["properties"] !=null){ selectedIndex = abc.indexOf(e["properties"]["name"]) }
        else{ selectedIndex = abc.indexOf(e["city"]) }
            
        // If the item is in the array...
        if (selectedIndex > -1){

            // Create an array for temporary storage.
            var selectedArrayTemp = [];

            // Check each item in the existing global array to see if it's the one that has been selected.
            SELECTEDARRAY.forEach(function(item){     
                // If it's not, copy it to the temporary array.
                if(SELECTEDARRAY.indexOf(item) != selectedIndex){ selectedArrayTemp.push(item) }
            })

            // Copy the items in the temporary array to the global array.
            SELECTEDARRAY = selectedArrayTemp;

        }
        // If the selected item is not in the global array...
        else {

            // If the global array already has 4 items, remove the first item.
            if (SELECTEDARRAY.length == 4){ SELECTEDARRAY.shift() }

            // Add the selected item to the end of the global array.
            (TYPE == "state") ? SELECTEDARRAY.push([e["properties"]["name"], "state"]) : SELECTEDARRAY.push([e["city"], "city"])

        }
    }
    else{ 
        if(TYPE == "city"){ (e["city"] == SELECTED) ? SELECTED = null : SELECTED = e["city"] }
        else{ (e["properties"]["name"] == SELECTED) ? SELECTED = null : SELECTED = e["properties"]["name"] } 
        SELECTEDARRAY = [];
        console.log(SELECTED)
    }
    
}

/**
Only outline the states or cities that are in the current global selection.
**/
MapVis.prototype.updateOutlines = function(){
    
    var that = this;
    
    // Return all path and circle element outlines to their default color and layer. 
    $(".stateArea").prependTo("#stateLayer")
    d3.selectAll(".stateArea")
      .attr("stroke", function(d) { 
            if(d){ return (d["properties"]["value"]) ? "none" : that.valueless(this, groupColorScale(GROUP)) }                               
      })
      .attr("stroke-width", 1) 
    this.svg.selectAll("circle").attr("stroke", function(d) { return (d.value) ? "white" : "none" })
                                .attr("stroke-width", 1) 
    
    // Now outline the path(s) or circle(s) in the selection if the selection is not empty.
    // If the bar chart is showing, outline every item in the selection. 
    // Remove spaces from item name so that the document can be searched for the item class name.
    if (isBarActive()){ SELECTEDARRAY.forEach(function(item){ execOutline(item[0].replace(/\s/g, '')) }) }
    // If the line chart is showing, outline only the single selected element.
    else { 
        if(SELECTED != null){ 
            if(TYPE == "state"){ execOutline(SELECTED.replace(/\s/g, '')) }
            else{ execOutline2(((SELECTED.replace(/\s/g, '')).replace('(', '')).replace(')', '')) }
        }
    }

    function execOutline(e){
        var elem = that.svg.selectAll("." + ((e).replace('(', '')).replace(')', ''))[0][0];
        if(elem.tagName == "path"){ document.getElementById("selectedLayer").appendChild(elem) }
        d3.select(elem).attr("stroke", "black").attr("stroke-width", 2)
    }
          
    function execOutline2(e){
        var elem = that.svg.selectAll("." + e)[0][0];
        d3.select(elem).attr("stroke", "black").attr("stroke-width", 2)
    }
    
}

MapVis.prototype.valueless = function(e, color){
    document.getElementById("valuelessLayer").appendChild(e)
    return color
}

MapVis.prototype.clearValueless = function(){
    $("#valuelessLayer .stateArea").prependTo("#stateLayer")
}

MapVis.prototype.moveToSelectedLayer = function(d, element){
    
    if (isBarActive()){ 
        var abc = [];
        SELECTEDARRAY.forEach(function(item){abc.push(item[0])})
        if(abc.indexOf(d["properties"]["name"]) == -1){ execMove() } 
    } 
        
    else{ if (d["properties"]["name"] != SELECTED ) { execMove() } }
    
    function execMove(){
        document.getElementById("selectedLayer").appendChild(element)
        d3.select(element).attr("stroke", "black").attr("stroke-width", 1)
    }
    
}

MapVis.prototype.removeFromSelectedLayer = function(d, element){
    
    var that = this;
    var exec = function(){
        document.getElementById("stateLayer").appendChild(element)
        d3.select(element)
          .attr("stroke", function() { return (d["properties"]["value"]) ? "none" : that.valueless(element, groupColorScale(GROUP)) })
    }
    
    if (isBarActive()){ 
        var abc = [];
        SELECTEDARRAY.forEach(function(item){abc.push(item[0])})
        if(abc.indexOf(d["properties"]["name"]) == -1){ exec() } 
    }                                          
    else{ if (d["properties"]["name"] != SELECTED ) { exec() } }
   
}

MapVis.prototype.getColorScale = function(){
    
    var that = this;
    
    var range = [];
    var rangeScale = d3.scale.linear()
                       .domain([0,9])
                       .range(["#d3d3d3",groupColorScale(GROUP)])
    for (i=0; i<10; i++){ range.push(rangeScale(i)) }
    
    var domain = [];
    that.displayStateData.forEach(function(d){ domain.push(+d["values"][YEAR]["values"][0][GROUP]) })
    that.displayCityData.forEach(function(d){ domain.push(+d["values"][YEAR]["values"][0][GROUP]) })
    
    var range2 = d3.extent(domain, function(d){ return d})
    d3.select("#lowestScore").html(range2[0])
    d3.select("#highestScore").html(range2[1])
    
    // Initalize color scale.
    return d3.scale.quantile().domain(domain).range(range)
    
}