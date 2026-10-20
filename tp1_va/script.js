const width = 1000;
const height = 550;

const margin = {
  top: 30,
  right: 120,
  bottom: 60,
  left: 60
};

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.csv("titanic-data.csv").then(data => {

  
  // 1) d3.group() 
  
  const grouped = d3.group(
    data,
    d => d.Pclass,
    d => d.Gender
  );

  console.log("d3.group() : ", grouped);

  //  dans l'ordre 1,2,3
  const classes = ["1", "2", "3"];

  const result = classes.map(c => ({
    Pclass: c,
    male: grouped.get(c)?.get("male")?.length || 0,
    female: grouped.get(c)?.get("female")?.length || 0
  }));

  console.log("result : ", result);

  
  // 2) d3.stack() 
  
  const stack = d3.stack()
    .keys(["male", "female"]);

  const series = stack(result);

  console.log("d3.stack() : ", series);

  
  // 3) d3.scaleBand()    pour presenter les classes sur l'axe X
  
  const x = d3.scaleBand()
    .domain(classes)
    .range([margin.left, width - margin.right])
    .padding(0.08);

  
  // 4) d3.scaleLinear()   pour presenter le nombre de passagers sur l'axe Y
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(result, d => d.male + d.female)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  
  // 5) d3.scaleOrdinal()  pour presenter les couleurs  (male et female)
  
  const color = d3.scaleOrdinal()
    .domain(["male", "female"])
    .range(["#d9ecef", "#efe6b0"]);

  console.log("d3.scaleOrdinal() : ", color.domain());

  
  // 6) dessin des barres empilées
  
  svg.selectAll(".serie")
    .data(series)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d.data.Pclass))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth());

  
  // 7) axe X
  
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

 
  // 8) axe Y
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // texte axe X
  svg.append("text")
    .attr("x", (width - margin.right + margin.left) / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .text("Class");

  // légende
  const legend = svg.selectAll(".legend")
    .data(["male", "female"])
    .join("g")
    .attr("transform", (d, i) => `translate(${width - 95}, ${40 + i * 25})`);

  legend.append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", d => color(d));

  legend.append("text")
    .attr("x", 22)
    .attr("y", 12)
    .text(d => d);

}).catch(error => console.error(error));