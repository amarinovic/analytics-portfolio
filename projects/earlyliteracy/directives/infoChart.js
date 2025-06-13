/*
infoChart.js
*/

literacyApp.directive("infoChart", function(){
 
    function link(scope, element, attr){
    
        var height = 150,
            width = 1000;

        var dataset = [];
        
        var numberOfPeople = 96;
        
        var svg = d3.select(element[0])
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width)
                    .attr("id", "infoSvg");
  
        for(i = 0; i < numberOfPeople; i++){ dataset.push([i]) }
    
        function yPosition(e){ return (e < numberOfPeople / 2) ? 5 : 65 }
        function xPosition(e){ return (e < numberOfPeople / 2) ? e : (e - 48) }
    
        d3.xml("person.svg","image/svg+xml", function(xml){  
        
            var importedNode = document.importNode(xml.documentElement, true);
        
            svg.selectAll("g")
               .data(dataset)
               .enter()
               .append("g")
               .attr("transform", function(d, i){ 
                    return "translate(" + (xPosition(i) * ((width - 15) / (dataset.length / 2))) + "," 
                            + yPosition(d) + ")"
                            +"scale("+ 0.4 +")";
                })
                .attr("class", "person")
                .each(function(d, i){ 
                    var plane = this.appendChild(importedNode.cloneNode(true)); 
                    d3.select(plane).selectAll("path").attr("fill", "grey");
                })
            
        })
        
        scope.$watch("data", function(value){
            
            
        })
        
    }
    return {
        link: link,
        restrict: "E",
        scope: { }
    }
    
})

function hoverActive(button, group){
    
    buttons = document.getElementsByClassName("infoButton")
    for (var b = 0; b < buttons.length; b++){
        if (buttons[b].classList.contains("active"))
            buttons[b].classList.remove("active")
    }
    
    button.classList.add("active")
    
    hoverAnimation(group)
}

function hoverAnimation(group){
    
    var domain = ["proficient", "notProficient", "poor", "minority"];
    
    var colorScale = d3.scale.ordinal()
                       .domain(domain)
                       .range(["#003663", "#c4161c", "#fdb713", "#f15728"]);

    var numberScale = d3.scale.ordinal()
                        .domain(domain)
                        .range([4, 16, 24, 32]);
    
    var people = d3.select("#infoSvg")
                   .selectAll(".person")
                   .selectAll("path");
    
    people.forEach(function(person,i){
        
        var personPaths = [person[0], person[1]];
        
        personPaths.forEach(function(path){
            d3.select(path)
              .transition()
              .delay(function(){ return (i/8) * 750 })
              .ease("linear")
              .attr("fill", function(){ return (i < numberScale(group)) ? colorScale(group) : "grey" })
        })
        
    })
    
    d3.selectAll(".infoText:not(#" + group + ")").style("display", "none")
    d3.select("#infoTitle").style("display", "none")
    d3.select("#" + group).style("display", "block")

}

function hoverClear(button){
    
    if (button.className.indexOf("active") == -1){
    
        var people = d3.select("#infoSvg")
                       .selectAll(".person")
                       .selectAll("path");

        people.forEach(function(person,i){
            d3.select(person[0]).transition().duration(750).ease("linear").attr("fill", "grey")
            d3.select(person[1]).transition().duration(750).ease("linear").attr("fill", "grey")
        })

        d3.selectAll(".infoText").style("display", "none")
        d3.select("#infoTitle").style("display", "block")
        
    }
    
    buttons = document.getElementsByClassName("infoButton")
    for (var b = 0; b < buttons.length; b++){
        if (buttons[b].classList.contains("active"))
            hoverAnimation(buttons[b].value)
    }
    
}