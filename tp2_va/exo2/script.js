
const width = 1000;
const height = 450;

const margin = {
  top: 40,
  right: 20,
  bottom: 100,
  left: 30
};

const variables = [
  "Length",
  "Diameter",
  "Height",
  "Whole_weight",
  "Shucked_weight",
  "Viscera_weight",
  "Shell_weight",
  "Rings"
];

d3.csv("abalone.csv", d => {
  const row = {};

  variables.forEach(v => {
    row[v] = +d[v];
  });

  return row;
}).then(data => {

  const svg = d3.select("#boxplot")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(variables)
    .range([margin.left, width - margin.right])
    .padding(0.35);

  // Axe horizontal : noms des variables
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-35)")
    .style("text-anchor", "end")
    .attr("font-size", 11);

  variables.forEach(variable => {

    const values = data
      .map(d => d[variable])
      .filter(v => Number.isFinite(v))
      .sort(d3.ascending);

    const q1 = d3.quantileSorted(values, 0.25);
    const median = d3.quantileSorted(values, 0.5);
    const q3 = d3.quantileSorted(values, 0.75);

    const iqr = q3 - q1;

    const lowerLimit = q1 - 1.5 * iqr;
    const upperLimit = q3 + 1.5 * iqr;

    const inside = values.filter(v =>
      v >= lowerLimit && v <= upperLimit
    );

    const min = d3.min(inside);
    const max = d3.max(inside);

    // Échelle indépendante pour chaque variable
    const y = d3.scaleLinear()
      .domain(d3.extent(values))
      .range([height - margin.bottom - 10, margin.top])
      .nice();

    const center = x(variable) + x.bandwidth() / 2;
    const boxWidth = x.bandwidth();

    // Moustaches
    svg.append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min))
      .attr("y2", y(max))
      .attr("stroke", "#555");

    // Extrémités des moustaches
    [min, max].forEach(value => {
      svg.append("line")
        .attr("x1", center - boxWidth * 0.25)
        .attr("x2", center + boxWidth * 0.25)
        .attr("y1", y(value))
        .attr("y2", y(value))
        .attr("stroke", "#555");
    });

    // Boîte Q1 - Q3
    svg.append("rect")
      .attr("x", center - boxWidth / 2)
      .attr("y", y(q3))
      .attr("width", boxWidth)
      .attr("height", Math.max(1, y(q1) - y(q3)))
      .attr("fill", "#83c9c3")
      .attr("stroke", "#287e80");

    // Médiane
    svg.append("line")
      .attr("x1", center - boxWidth / 2)
      .attr("x2", center + boxWidth / 2)
      .attr("y1", y(median))
      .attr("y2", y(median))
      .attr("stroke", "#243b63")
      .attr("stroke-width", 2);

    // Valeurs aberrantes
    values.filter(v =>
      v < lowerLimit || v > upperLimit
    ).forEach(value => {
      svg.append("circle")
        .attr("cx", center)
        .attr("cy", y(value))
        .attr("r", 1.5)
        .attr("fill", "#d95d5d")
        .attr("opacity", 0.65);
    });
  });

}).catch(error => {
  console.error(error);
  d3.select("#boxplot")
    .text("Erreur : vérifiez le nom du fichier CSV.");
});
