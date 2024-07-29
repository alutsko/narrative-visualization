// Load the datasets
Promise.all([
    d3.csv("data/wine_production.csv"),
    d3.csv("data/alcohol_consumption.csv")
]).then(([wineData, alcoholData]) => {
    // Process the data
    const franceWineData = wineData.map(d => ({
        year: +d.Year,
        production: +d["Wine Production tonnes"]
    }));
    const franceAlcoholData = alcoholData.map(d => ({
        year: +d.Year,
        consumption: +d["Alcohol Consumption"]
    }));

    // Initialize scenes
    initScenes(franceWineData, franceAlcoholData);
});

function initScenes(wineData, alcoholData) {
    // Clear container
    d3.select("#container").html("");

    // Event listeners for scene buttons
    d3.select("#scene1").on("click", () => createWineProductionScene(wineData));
    d3.select("#scene2").on("click", () => createAlcoholConsumptionScene(alcoholData));
    d3.select("#scene3").on("click", () => createComparisonScene(wineData, alcoholData));
    d3.select("#explore").on("click", () => createExplorationScene(wineData, alcoholData));

    // Display the introduction scene initially
    createIntroductionScene();
}

function createIntroductionScene() {
    const container = d3.select("#container");

    container.html("<h1>Wine Production and Alcohol Consumption in France</h1><p>This narrative visualization explores the relationship between wine production and alcohol consumption in France over the years. Click on the buttons above to navigate through the scenes.</p>");
}

function createWineProductionScene(data) {
    const container = d3.select("#container").html("");

    const svg = container.append("svg")
        .attr("width", 800)
        .attr("height", 500)
        .attr("class", "chart");

    const margin = { top: 40, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x.domain(data.map(d => d.year));
    y.domain([0, d3.max(data, d => d.production)]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickValues(x.domain().filter((d, i) => i % 5 === 0))
            .tickFormat(d3.format("d")));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "s"));

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.production))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.production))
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "orange");
            showTooltip(event, `Year: ${d.year}<br>Production: ${d.production} tonnes`);
        })
        .on("mouseout", function() {
            hideTooltip();
        });

    // Add title
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("Wine Production in France Over the Years");

    // Add annotations
    addWineProductionAnnotations(g, x, y, data);
    // TODO put similar in the other two charts?
}

function createAlcoholConsumptionScene(data) {
    const container = d3.select("#container").html("");

    const svg = container.append("svg")
        .attr("width", 800)
        .attr("height", 500)
        .attr("class", "chart");

    const margin = { top: 40, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const reversedData = data.slice().reverse();

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x.domain(reversedData.map(d => d.year));
    y.domain([0, d3.max(reversedData, d => d.consumption)]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10, "s"));

    g.selectAll(".bar")
        .data(reversedData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.consumption))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.consumption))
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "orange");
            showTooltip(event, `Year: ${d.year}<br>Consumption: ${d.consumption} litres`);
        })
        .on("mouseout", function() {
            hideTooltip();
        });

    // Add title
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("Alcohol Consumption in France Over the Years");
}

function createComparisonScene(wineData, alcoholData) {
    const container = d3.select("#container").html("");

    const svg = container.append("svg")
        .attr("width", 800)
        .attr("height", 500)
        .attr("class", "chart");

    const margin = { top: 40, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const x = d3.scaleLinear().rangeRound([0, width]);
    const y1 = d3.scaleLinear().rangeRound([height, 0]);
    const y2 = d3.scaleLinear().rangeRound([height, 0]);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x.domain(d3.extent(wineData, d => d.year));
    y1.domain([0, d3.max(wineData, d => d.production)]);
    y2.domain([0, d3.max(alcoholData, d => d.consumption)]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y1).ticks(10, "s"))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -33)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Wine Production (tonnes)");

    g.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y2).ticks(10, "s"))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -12)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Alcohol Consumption (litres)");

    const line1 = d3.line()
        .x(d => x(d.year))
        .y(d => y1(d.production));

    const line2 = d3.line()
        .x(d => x(d.year))
        .y(d => y2(d.consumption));

    g.append("path")
        .datum(wineData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("class", "line")
        .attr("d", line1);

    g.append("path")
        .datum(alcoholData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("class", "line")
        .attr("d", line2);

    g.selectAll(".dot")
        .data(wineData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y1(d.production))
        .attr("r", 3)
        .on("mouseover", function(event, d) {
            showTooltip(event, `Year: ${d.year}<br>Wine Production: ${d.production} tonnes`);
        })
        .on("mouseout", hideTooltip);

    g.selectAll(".dot")
        .data(alcoholData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y2(d.consumption))
        .attr("r", 3)
        .on("mouseover", function(event, d) {
            showTooltip(event, `Year: ${d.year}<br>Alcohol Consumption: ${d.consumption} litres`);
        })
        .on("mouseout", hideTooltip);

    // Add title
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("Comparison of Wine Production and Alcohol Consumption in France");

    // Add annotations
    addComparisonAnnotations(g, x, y1, y2, wineData, alcoholData);
}

console.log(d3.sliderBottom);  // Check if d3.sliderBottom is defined

function createExplorationScene(wineData, alcoholData) {
    if (typeof d3.sliderBottom !== 'function') {
        console.error('d3.sliderBottom is not defined');
        return;
    }
    const container = d3.select("#container").html("");

    // Create a combined chart for exploration
    const svg = container.append("svg")
        .attr("width", 800)
        .attr("height", 500)
        .attr("class", "chart");

    const margin = { top: 40, right: 20, bottom: 90, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const x = d3.scaleLinear().rangeRound([0, width]);
    const y1 = d3.scaleLinear().rangeRound([height, 0]);
    const y2 = d3.scaleLinear().rangeRound([height, 0]);

    x.domain(d3.extent(wineData, d => d.year));
    y1.domain([0, d3.max(wineData, d => d.production)]);
    y2.domain([0, d3.max(alcoholData, d => d.consumption)]);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y1).ticks(10, "s"))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -33)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Wine Production (tonnes)");

    g.append("g")
        .attr("class", "axis axis--y2")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y2).ticks(10, "s"))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -12)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Alcohol Consumption (litres)");
    
    const line1 = d3.line()
        .x(d => x(d.year))
        .y(d => y1(d.production));

    const line2 = d3.line()
        .x(d => x(d.year))
        .y(d => y2(d.consumption));

    const path1 = g.append("path")
        .datum(wineData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("class", "line")
        .attr("d", line1);

    const path2 = g.append("path")
        .datum(alcoholData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("class", "line")
        .attr("d", line2);
    
    // Add the slider for selecting the year range
    const yearSlider = d3.sliderBottom()
        .min(d3.min(wineData, d => d.year))
        .max(d3.max(wineData, d => d.year))
        .step(1)
        .width(740)
        .tickFormat(d3.format("d"))
        .default([d3.min(wineData, d => d.year), d3.max(wineData, d => d.year)])
        .on('onchange', val => {
            const filteredWineData = wineData.filter(d => d.year >= val[0] && d.year <= val[1]);
            const filteredAlcoholData = alcoholData.filter(d => d.year >= val[0] && d.year <= val[1]);

            path1.datum(filteredWineData)
                .transition()
                .duration(500)
                .attr("d", line1);

            path2.datum(filteredAlcoholData)
                .transition()
                .duration(500)
                .attr("d", line2);
        });

    const sliderGroup = svg.append("g")
        .attr("transform", `translate(${margin.left},${height + margin.bottom - 20})`)
        .call(yearSlider);

    // Add title
    svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("class", "chart-title")
        .text("Exploration of Wine Production and Alcohol Consumption in France");
}

function showTooltip(event, content) {
    const tooltip = d3.select("#tooltip");
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html(content)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
}

function hideTooltip() {
    const tooltip = d3.select("#tooltip");
    tooltip.transition().duration(500).style("opacity", 0);
}



function addWineProductionAnnotations(g, x, y, data) {
    const annotations = [
        { year: 1961, label: "1961: Best vintage", position: "center" },
        { year: 1985, label: "Extraordinary vintage", position: "center" },
        { year: 1988, label: "Extraordinary vintage", position: "center" },
        { year: 1995, label: "Extraordinary vintage", position: "center" },
        { year: 1989, label: "1989-1991: Glorious 3 years", position: "center", endYear: 1991 },
        { year: 2018, label: "2018-2020: Glorious 3 years", position: "center", endYear: 2020 }
    ];

    annotations.forEach(d => {
        const yearData = data.find(item => item.year === d.year);

        if (yearData) {
            const xPos = x(yearData.year) + x.bandwidth() / 2;
            const yPos = y(0) - 10;

            g.append("text")
                .attr("x", xPos)
                .attr("y", yPos)
                .attr("dy", ".35em")
                .attr("class", "annotation")
                .attr("text-anchor", "right")
                .attr("transform", `rotate(-90 ${xPos} ${yPos})`) // Rotate the text 90 degrees
                .text(d.label)
                .attr("fill", "black")
                .attr("font-size", "12px");
        }
    });
}


function addAlcoholConsumptionAnnotations(g, x, y, data) {
    // Example annotation: Highlight a specific year
    const annotation = data.find(d => d.year === 2000);

    if (annotation) {
        g.append("text")
            .attr("x", x(annotation.year) + x.bandwidth() / 2)
            .attr("y", y(annotation.consumption) - 10)
            .attr("text-anchor", "middle")
            .attr("class", "annotation");
    }
}

function addComparisonAnnotations(g, x, y1, y2, wineData, alcoholData) {
    const annotations = [
        { year: 1961, label: "1961: Best vintage", yPosition: "production" },
        { year: 1985, label: "Extraordinary vintage", yPosition: "production" },
        { year: 1988, label: "Extraordinary vintage", yPosition: "production" },
        { year: 1995, label: "Extraordinary vintage", yPosition: "production" },
        { year: 1989, label: "1989-1991: Glorious 3 years", yPosition: "production", endYear: 1991 },
        { year: 2018, label: "2018-2020: Glorious 3 years", yPosition: "production", endYear: 2020 }
    ];

    annotations.forEach(d => {
        const yearData = wineData.find(item => item.year === d.year);

        if (yearData) {
            const xPos = x(yearData.year);
            const yPos = y1(0) - 10;

            g.append("text")
                .attr("x", xPos)
                .attr("y", yPos)
                .attr("dy", ".35em")
                .attr("class", "annotation")
                .attr("text-anchor", "right")
                .attr("transform", `rotate(-90 ${xPos} ${yPos})`) // Rotate the text 90 degrees
                .text(d.label)
                .attr("fill", "black")
                .attr("font-size", "12px");
        }
    });
}


function addHoverInteraction(g, x, y1, y2, wineData, alcoholData) {
    // Add hover interaction for exploration
    const focus = g.append("g")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 5)
        .attr("class", "focus-circle");

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("class", "focus-text");

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "overlay")
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => focus.style("display", "none"))
        .on("mousemove", mousemove);

    function mousemove(event) {
        const bisect = d3.bisector(d => d.year).left;
        const x0 = x.invert(d3.pointer(event, this)[0]);
        const i = bisect(wineData, x0, 1);
        const d0 = wineData[i - 1];
        const d1 = wineData[i];
        const d = x0 - d0.year > d1.year - x0 ? d1 : d0;
        
        focus.attr("transform", `translate(${x(d.year)},${y1(d.production)})`);
        focus.select("text").text(`Year ${d.year}: ${d.production} tonnes`);
    }
}
