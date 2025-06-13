/*****
GLOBAL VARIABLES
*****/

var DATASETS = {},
    DATASET,
    GRADE = 4,
    SUBJECT = "READ",
    GROUP = "averageScore",
    YEAR = 10,
    STATES,
    STATEOUTLINES,
    CITIES,
    CITYNAMES = [],
    indexByStateName = {},
    indexByCityName = {},
    colorScale,
    yearScale,
    SERIES = ["averageScore", "frlScore", "ellScore", "asianScore", "blackScore", "hispanicScore", "whiteScore"];
    SELECTED = null, 
    SELECTEDARRAY = [];
    TYPE = "state";
    PLAY = false,
    CITIESON = true;
    NATIONALBARS = false;
    FIRST = true;

/*****
INITIALIZE THE PAGE
*****/

$(function(){
   
    // Open data files.
    queue()
        .defer(d3.json, "data/json/math4.json")
        .defer(d3.json, "data/json/read4.json")
        .defer(d3.json, "data/json/math8.json")
        .defer(d3.json, "data/json/read8.json")
        .defer(d3.json, "data/json/us-states.json")
        .defer(d3.json, "data/json/states.json")
        .defer(d3.json, "data/json/cities.json")
        .await(load)

    // Assign loaded data to global variables.
    function load(error, math4, read4, math8, read8, states, stateoutlines, cities){

        if(!error){

            DATASETS["MATH4"] = math4;
            DATASETS["READ4"] = read4;
            DATASETS["MATH8"] = math8;
            DATASETS["READ8"] = read8;
            STATES = states;
            STATEOUTLINES = stateoutlines;
            CITIES = cities;

            initialize()
          }
        
    }
        
    // Initalize the layouts and event handlers.
    function initialize(){
        
        DATASET = DATASETS["READ4"];
        
        // Create dictionaries for ease of reference.
        var nestedStateData = nest()[0]["values"]
        nestedStateData.forEach(function(state,i){ indexByStateName[state["key"]] = i })
        var nestedCityData = nest()[1]["values"]
        nestedCityData.forEach(function(city,i){ 
            indexByCityName[city["key"]] = i 
            CITYNAMES.push(city.key)
        })

        var eventHandler = new Object();
        
        // Call object prototypes.
        mapvis = new MapVis(d3.select("#mapVis"), eventHandler);
        linevis = new LineVis(d3.select("#lineVis"));
        barvis = new BarVis(d3.select("#barVis"));
        
        // Bind the event handler to the vis objects. 
        $(eventHandler).bind("selectionChanged", function(event, selected){

            linevis.onSelectionChange(selected);
            barvis.onSelectionChange();

        })
        
        // Initialize the slider and slider labels.
         d3.select("#sliderSpan")
           .html("<input type='range' id='slider' value='" + YEAR + "' step='1' min='0' max='" + maxYear(DATASET) + "' oninput='updateYear(this.value)'>")
         initializeSliderLabels()
         updateSliderLabels()
         
         // Initialize chart titles.
         updateGradeTitles()
         updateYearTitles()
         updateSubjectTitles()
         d3.select("#groupMap").html(groupScale(GROUP))
    
    }
    
})

/*****
PAGE ELEMENT UPDATES
*****/

function updateGradeTitles(){
     d3.select("#gradeMap").html(GRADE)
     d3.select("#gradeLine").html(GRADE)
     d3.select("#gradeBar").html(GRADE)
}

function updateSubjectTitles(){
    d3.select("#subjectMap").html(subjectScale(SUBJECT))
    d3.select("#subjectLine").html(subjectScale(SUBJECT))
    d3.select("#subjectBar").html(subjectScale(SUBJECT))
}

function updateYearTitles(){
     d3.select("#yearMap").html(yearScale(YEAR))
     d3.select("#yearBar").html(yearScale(YEAR))
}

function initializeSliderLabels(){
    
    d3.select("#sliderLabels")
      .append("g")
      .attr("class", "rangeAxis xAxis")
      .attr("transform", "translate(0,5)")
    
}

function updateSliderLabels(){    
    
    // Update scales with the new dataset stats.
    yearScale = d3.scale.ordinal().domain(yearScaleDomain(DATASET))
                  .range(yearScaleRange(DATASET));
        
    var xScale = d3.scale.linear()
                         .range([15, 385])
                         .domain([0,maxYear()])

    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
    
    // Update the axes.    
    d3.select("#sliderLabels")
      .selectAll(".xAxis")
      .transition()
      .duration(750)
      .call(xAxis)
    
    d3.select("#sliderLabels")
      .selectAll(".xAxis")
      .selectAll("text")
      .text(function(d){return yearScale(d)})
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-weight", function(d,i){ return (i == YEAR) ? "bold" : "normal" })
    
}

function updateOutlines(){
    
    SELECTEDARRAY = [];
    SELECTED = null;
    mapvis.updateOutlines()
    barvis.wrangleData()
    barvis.updateVis()
    
}

/*****
USER TASKS
*****/

function toggleCities(){
    
    CITIESON = !CITIESON;
    $("#mapVis circle").each(function(){ (CITIESON) ? $(this).fadeIn("slow") : $(this).fadeOut("slow") });
        
}

function toggleNationalBars(){
    
    NATIONALBARS = !NATIONALBARS;
    (NATIONALBARS) ? barvis.updateVisNational() : barvis.removeNationalBars()
        
}

/**
Show or hide lines on linechart based on selected checkboxes.
**/
function filterLine(){

    // Figure out what is and isn't checked.
    d3.selectAll(".filterCheckbox").each(function(){
        
        var that = this;
        
        d3.select("#lineVis").selectAll("path." + this.value)
                             .style("display", function(){ return (that.checked) ? "block" : "none" });
        d3.select("#lineVis").selectAll("circle." + this.value)
                             .style("display", function(){ return (that.checked) ? "block" : "none" });
        
    })
    
}

function playSlider(){
    
    PLAY = !PLAY;
    
    if (PLAY){
        
        d3.select("#pause").style("display", "inline");
        d3.select("#play").style("display", "none");
        
        var increment = 0;
        var max = maxYear(DATASET);
        
        var timer = setInterval(function(){
            
            if (increment == max || !(PLAY)){
                clearInterval(timer);
                d3.select("#pause").style("display", "none");
                d3.select("#play").style("display", "inline");
                PLAY = false;
            }
            
            d3.select("#slider").property("value", increment);
            updateYear(increment)
            increment += 1;
        }, 1000);
        
    }
    
}

// Update the visualization with the indicated dataset.
function updatePage(){
    
    datasetTemp = DATASET;
    
    // Gather input values.
    d3.selectAll(".dropDown").each(function(d){
        
        if (this.name == "grade"){ GRADE = this.value; }
        else if (this.name == "subject"){ SUBJECT = this.value; }
        else if (this.name == "group"){ GROUP = this.value; }
        
    })
    
    var datasetKey = SUBJECT + GRADE;
    
    // Access the new dataset.
    DATASET = DATASETS[datasetKey];
    
    // When a group is selected, the dataset doesn't change.
    // But when the dataset changes, default to the max year of the dataset.
    if (datasetTemp != DATASET){ 
        
        YEAR = maxYear() 
        document.getElementById("slider").max = YEAR;
        document.getElementById("slider").value = YEAR;
        updateSliderLabels()
        
    }
    
    // Update the visualizations. 
    mapvis.wrangleData()
    mapvis.clearValueless()
    mapvis.updateVis()
    mapvis.updateOutlines()
    
    linevis.initializeVis()
    if (SELECTED != null){
        (TYPE == "state") ? linevis.wrangleData("state", indexByStateName[SELECTED]) : linevis.wrangleData("city", indexByCityName[SELECTED])
        linevis.updateVis()
    }
    
    barvis.wrangleData();
    barvis.updateVis();
    if(NATIONALBARS){ barvis.updateVisNational() }
    
    // Update chart titles.
    updateGradeTitles()
    updateSubjectTitles()
    updateYearTitles() 
    d3.select("#groupMap").html(groupScale(GROUP))
    
}

/**
Update the displayed year based on the slider selection.
**/
function updateYear(value){
    
    YEAR = value;
    
    // Update each chart.
    
    mapvis.wrangleData("state");
    mapvis.clearValueless();
    mapvis.updateVis(); 
    mapvis.updateOutlines(); 
    
    linevis.tracker.attr("x1", linevis.xScale(YEAR))
                   .attr("x2", linevis.xScale(YEAR))
    
    barvis.wrangleData();
    barvis.updateVis();
    if(NATIONALBARS){ barvis.updateVisNational() }
    
    // Update chart and axis labels.
    d3.select("#sliderLabels").selectAll("text")
      .style("font-weight", function(d,i){ return (i == YEAR) ? "bold" : "normal" })
    linevis.svg.selectAll(".xAxis").selectAll("text")
           .style("font-weight", function(d,i){ return (i == YEAR) ? "bold" : "normal" })
    updateYearTitles()          
              
}

/**
CHECK BOOLEANS
**/

function isBarActive(){ return $("#barchart").hasClass("active") ? true : false }

/*****
DATA WRANGLING
*****/

/**
Nest the data to more easily access the data for each geographical entity.
Use the globally recognized dataset.
**/
function nest(){
    return d3.nest()
             .key(function(d) { return d.type; })
             .key(function(d) { return d.jurisdiction; })
             .key(function(d) { return d.year; })
             .entries(DATASET);
}

/**
Determine the maximum year of the displayed dataset.
**/
function maxYear(){
    
    var nestedData = nest();
    return nestedData[2]["values"][0]["values"].length - 1;
    
}

/**
Find the rank of the state based on the available scores.
**/
function rank(state){
    
    // Wrangle data.
    var nested = nest()[jurisdictionScale("state")]["values"];
    var filtered = nested.filter(function(state) { return !isNaN(state["values"][YEAR]["values"][0][GROUP]) })
    var sorted = filtered.sort(function(a,b) { 
        return d3.descending(a["values"][YEAR]["values"][0][GROUP], b["values"][YEAR]["values"][0][GROUP]) 
    })
     
    // Determine state rank out of total states with data.
    var totalStates = 0;
    var sortedIndexByName = {};
    sorted.forEach(function (state,i){
        sortedIndexByName[state["key"]] = i;
        totalStates += 1;  
    })
    var stateRank = sortedIndexByName[state] + 1;

    return [stateRank, totalStates];
    
}

/*****
SCALES
*****/

/**
To access the correct type of geographical entity.
**/
jurisdictionScale = d3.scale.ordinal()
                            .domain(["state", "city", "nation"])
                            .range([0,1,2]);

/**
Determine the overall color based on the selected group.
**/
groupColorScale = d3.scale.ordinal()
                          .domain(["averageScore", "frlScore", "ellScore","asianScore", "blackScore", "hispanicScore", "whiteScore"])
                          .range(["#92c83e","#f15728","#0088a3", "grey", "#003663", "#c4161c","#fdb713"]);

/**
Return a clean group name given the group variable name.
**/
groupNameScale = d3.scale.ordinal()
                          .domain(["averageScore", "frlScore", "ellScore","asianScore", "blackScore", "hispanicScore", "whiteScore"])
                          .range(["All Students", "FRL", "ELL","Asian", "Black", "Hispanic", "White"])

/**
Given the group name variable return a group name title for the map title.
**/
groupScale = d3.scale.ordinal()
                     .domain(["averageScore", "frlScore", "ellScore","asianScore", "blackScore", "hispanicScore", "whiteScore"])
                     .range(["ALL STUDENTS", "FREE AND REDUCED LUNCH", "ENGLISH LANGUAGE LEARNERS","ASIAN", "BLACK", "HISPANIC", "WHITE"])

/**
Given the subject variable name return the full name of the subject.
**/
subjectScale = d3.scale.ordinal()
                       .domain(["READ", "MATH"])
                       .range(["READING", "MATHEMATICS"])

yearScaleDomain = d3.scale.ordinal()
                          .domain([DATASETS["MATH4"],DATASETS["MATH8"],DATASETS["READ4"],DATASETS["READ8"]])
                          .range([[0,1,2,3,4,5,6,7,8,9],
                                  [0,1,2,3,4,5,6,7,8,9],
                                  [0,1,2,3,4,5,6,7,8,9,10],
                                  [0,1,2,3,4,5,6,7]])

yearScaleRange = d3.scale.ordinal()
                         .domain([DATASETS["MATH4"],DATASETS["MATH8"],DATASETS["READ4"],DATASETS["READ8"]])
                         .range([[1990,1992,1996,2000,2003,2005,2007,2009,2011,2013],
                                 [1990,1992,1996,2000,2003,2005,2007,2009,2011,2013],
                                 [1992,1994, 1996,1998,2000,2003,2005,2007,2009,2011,2013],
                                 [1998,2002,2003,2005,2007, 2009, 2011,2013]])

    
stateInitialScale = d3.scale.ordinal()
                            .domain(["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
                                     "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
                                     "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
                                     "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
                                     "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
                                     "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
                                     "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyomning"])
                            .range(["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", 
                                    "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
                                    "NM", "NY", "NC","ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", 
                                    "VA", "WA", "WV", "WI", "WY"])

cityInitialScale = d3.scale.ordinal()
                            .domain(["Albuquerque", "Atlanta", "Austin", "Baltimore City", "Boston", "Charlotte", "Cleveland", "Dallas", "Detroit", "District of Columbia", "District of Columbia (DCPS)", "Fresno", "Hillsborough County (FL)", "Houston", "Jefferson County (KY)", "Los Angeles", "Miami-Dade", "Milwaukee", "New York City", "Philadelphia", "San Diego", "DoDEA"])
                            .range(["ALBQ", "ATL", "ATX", "BAL", "BOS", "CLT", "CLE", "DAL", "DTM", "DC", "DCPS", "FRS", "HIL", "HOU", "JKY", "LAX", "MIA", "MIL", "NYC", "PHL", "SAN", "DODEA"])

/**
Update the domain of the y scale based on the selected dataset.
**/
function yScaleDomain(){
    
    datasetRanges = [];
    SERIES.forEach(function(series){
        datasetRanges.push(d3.extent(DATASET, function(d){ if(!isNaN(d[series])) return d[series] }))    
    })
    
    return [+d3.min(datasetRanges, function(d){ return d[0] }) - 10, +d3.max(datasetRanges, function(d){ return d[1] })]
    
}