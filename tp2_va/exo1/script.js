
const width = 700;
const height = 360;
const margin = { top: 25, right: 35, bottom: 55, left: 65 };
const bandwidth = 2;
const genders = [
  { key: "male", label: "Homme", color: "#5b9bc6", stroke: "#28658a" },
  { key: "female", label: "Femme", color: "#e78b58", stroke: "#a84f25" }
];

function gaussianKernel(value) {
  return Math.exp(-0.5 * value * value) / Math.sqrt(2 * Math.PI);
}

d3.csv("titanic-data.csv", row => ({
  gender: row.Gender.trim().toLowerCase(),
  age: row.Age.trim() === "" ? NaN : Number(row.Age)
})).then(rows => {
  const groups = genders.map(gender => ({
    ...gender,
    ages: rows
      .filter(row => row.gender === gender.key && Number.isFinite(row.age))
      .map(row => row.age)
  }));
  const ages = groups.flatMap(group => group.ages);

  if (ages.length === 0) {
    throw new Error("Le fichier titanic-data.csv ne contient aucun âge exploitable.");
  }

  const xMin = 0;
  const xMax = 80;
  const densities = groups.map(group => ({
    ...group,
    values: d3.range(xMin, xMax + 0.1, 0.1).map(age => ({
      age,
      value: d3.sum(group.ages, sample =>
        gaussianKernel((age - sample) / bandwidth)
      ) / bandwidth
    }))
  }));

  const svg = d3.select("#kdeChart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Courbes de densité superposées des âges des passagers et passagères du Titanic");

  const x = d3.scaleLinear()
    .domain([xMin, xMax])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(densities, group =>
      d3.max(group.values, point => point.value)
    ) * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickSize(-(width - margin.left - margin.right))
    .tickFormat(d3.format("~g"));

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .call(axis => axis.select(".domain").remove())
    .call(axis => axis.selectAll(".tick line").attr("stroke", "#dedede"))
    .call(axis => axis.selectAll(".tick text").attr("fill", "#555"));

  const area = d3.area()
    .x(point => x(point.age))
    .y0(y(0))
    .y1(point => y(point.value))
    .curve(d3.curveBasis);

  const line = d3.line()
    .x(point => x(point.age))
    .y(point => y(point.value))
    .curve(d3.curveBasis);

  densities.forEach(group => {
    svg.append("path")
      .datum(group.values)
      .attr("fill", group.color)
      .attr("fill-opacity", 0.82)
      .attr("d", area);

    svg.append("path")
      .datum(group.values)
      .attr("fill", "none")
      .attr("stroke", group.stroke)
      .attr("stroke-width", 1.5)
      .attr("d", line);
  });

  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right - 105},${margin.top + 5})`);

  legend.append("text")
    .attr("font-weight", "bold")
    .attr("y", 0)
    .text("Genre");

  genders.forEach((gender, index) => {
    const item = legend.append("g")
      .attr("transform", `translate(0,${18 + index * 20})`);

    item.append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", gender.color);

    item.append("text")
      .attr("x", 20)
      .attr("y", 11)
      .text(gender.label);
  });

  svg.append("text")
    .attr("x", (margin.left + width - margin.right) / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Âge (années)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .text("Densité mise à l’échelle");
}).catch(error => {
  console.error("Erreur lors du chargement ou du tracé du dataset Titanic :", error);
  d3.select("#kdeChart")
    .append("p")
    .attr("role", "alert")
    .text("Impossible de tracer le graphe. Vérifiez titanic-data.csv et lancez la page avec Live Server.");
});
