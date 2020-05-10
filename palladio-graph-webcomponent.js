import PalladioWebComponentAbstractBase from "./palladio-webcomponent-abstract.js";

window.customElements.define(
  "palladio-graph-component",
  class extends PalladioWebComponentAbstractBase {
    constructor() {
      super();
      this.stylesheets = ["palladio-graph-webcomponent.css"];
      this.scripts = ["https://d3js.org/d3.v4.min.js"];
    }

    drawGraph(graph, settings) {
      const {
        nodeSize, // whether to size the nodes or not
      } = settings;

      const svg = d3
          .select(this.svg)
          .call(
            d3
              .zoom()
              .on("zoom", () => svg.attr("transform", d3.event.transform)),
          ),
        width = +svg.attr("width"),
        height = +svg.attr("height");

      const sizeScale = d3.scaleSqrt().range([5, 20]);
      // Set the domain on the size scale.
      sizeScale.domain([
        d3.min(graph.nodes, (d) => d.count),
        d3.max(graph.nodes, (d) => d.count),
      ]);

      const simulation = d3
        .forceSimulation()
        .force(
          "link",
          d3.forceLink().id((d) => d.id),
        )
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60));

      const draw = (graph) => {
        const link = svg
          .append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(graph.links)
          .enter()
          .append("line")
          .attr("stroke-width", 0.5);

        const node = svg
          .append("g")
          .attr("class", "nodes")
          .selectAll("g")
          .data(graph.nodes)
          .enter()
          .append("g");

        const circles = node
          .append("circle")
          .attr("r", (d) => (nodeSize ? sizeScale(d.count) : 5))
          .attr("class", (d) => d.class)
          .call(
            d3
              .drag()
              .on("start", (d) => {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
              })
              .on("drag", (d) => {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
              })
              .on("end", (d) => {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
              }),
          );

        const labels = node
          .append("text")
          .text((d) => d.id)
          .attr("x", 6)
          .attr("y", 3);

        // node.append("title").text((d) => d.id);

        simulation.nodes(graph.nodes).on("tick", () => {
          link
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);
          node.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")");
        });
        simulation.force("link").links(graph.links);
      };

      draw(graph);
    }

    buildNodesAndLinks(rows, settings) {
      const nodes = {};
      const sources = new Set();
      const targets = new Set();
      const links = [];
      const { sourceDimension, targetDimension } = settings;

      rows.forEach((datum) => {
        const source = datum[sourceDimension];
        const target = datum[targetDimension];
        nodes[source] = (nodes[source] || 0) + 1;
        nodes[target] = (nodes[target] || 0) + 1;
        sources.add(source);
        targets.add(target);
        if (
          links.findIndex((l) => l.source === source && l.target === target) ===
            -1 &&
          links.findIndex((l) => l.source === target && l.target === source) ===
            -1
        )
          links.push({ source, target });
      });
      return {
        nodes: Object.entries(nodes).map(([id, count]) => ({
          id,
          count,
          class: [sources.has(id) && "source", targets.has(id) && "target"]
            .filter(Boolean)
            .join(" "),
        })),
        links,
      };
    }

    render(data) {
      if (!data) {
        return this.renderError("No Data!");
      }

      const rows = this.getRows(data);
      if (!rows) {
        return this.renderError(`
        <details>
          <summary>Malformed project data!</summary>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `);
      }

      const settings = this.getSettings(data, "graphView");
      if (!settings) {
        return this.renderError(`
        <details>
          <summary>Graph Visualization not available!</summary>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `);
      }

      this.body.innerHTML = '<svg width="960" height="600"></svg>';
      this.svg = this.body.querySelector("svg");
      const graph = this.buildNodesAndLinks(rows, settings);
      this.scriptsReady.then(() => {
        this.drawGraph(JSON.parse(JSON.stringify(graph)), settings);
      });
    }
  },
);
