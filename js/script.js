// Load the data and create the visualization
d3.csv("data/wine_production.csv").then(data => {
    // Process and visualize the data here
    console.log(data);
});

d3.csv("data/alcohol_consumption.csv").then(data => {
    // Process and visualize the data here
    console.log(data);
});

// Example function to create a basic chart
function createChart(data) {
    const svg = d3.select("#container")
        .append("svg")
        .attr("width", 800)
        .attr("height", 400);

    // Add your D3 chart creation code here
}
