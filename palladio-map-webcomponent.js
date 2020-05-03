import PalladioWebComponentAbstractBase from "./palladio-webcomponent-abstract.js";

window.customElements.define(
  "palladio-map-component",
  class extends PalladioWebComponentAbstractBase {
    constructor() {
      super();
      this.stylesheets = [
        "https://unpkg.com/leaflet@1.6.0/dist/leaflet.css",
        "palladio-map-webcomponent.css",
      ];
      this.scripts = ["https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"]
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

      const settings = this.getSettings(data, "mapView");
      if (!settings) {
        return this.renderError(`
        <details>
          <summary>Map Visualization not available!</summary>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `);
      }

    }
  }
);
