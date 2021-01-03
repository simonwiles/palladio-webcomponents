import cardsComponentStyles from "bundle-text:./palladio-cards-webcomponent.css";
import PalladioWebComponentAbstractBase from "./palladio-webcomponent-abstract.js";

const defaultTemplate = `
  <a target="_blank" class="link">
    <div class="card">
      <div class="image"></div>
      <div class="title"></div>
      <div class="subtitle"></div>
      <div class="text"></div>
    </div>
  </a>
`;

window.customElements.define(
  "palladio-cards-component",
  class extends PalladioWebComponentAbstractBase {
    constructor() {
      super();
      this.inlineStylesheets = [cardsComponentStyles];
    }

    render(data) {
      if (!data) {
        this.renderError("No Data!");
      }

      const rows = this.constructor.getRows(data);
      if (!rows) {
        this.renderError(`
        <details>
          <summary>Malformed project data!</summary>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `);
      }

      const settings = this.constructor.getSettings(data, "listView");
      if (!settings) {
        this.renderError(`
        <details>
          <summary>Gallery Visualization not available!</summary>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `);
      }

      const {
        imgurlDim,
        linkDim,
        sortDim,
        subtitleDim,
        textDim,
        titleDim,
      } = settings;

      const container = document.createElement("div");
      container.classList.add("palladio-cards");

      if (sortDim) {
        // Need some logic here to sort on non-string types
        rows.sort((a, b) => a[sortDim].localeCompare(b[sortDim]));
      }

      rows.forEach((row) => {
        const node = document
          .createRange()
          .createContextualFragment(defaultTemplate);
        if (row[linkDim]) node.querySelector(".link").href = row[linkDim];
        if (row[imgurlDim])
          node.querySelector(
            ".image",
          ).style.backgroundImage = `url(${row[imgurlDim]})`;
        node.querySelector(".title").innerText = row[titleDim];
        node.querySelector(".subtitle").innerText = row[subtitleDim];
        node.querySelector(".text").innerText = row[textDim];
        container.appendChild(node);
      });

      this.body.innerHTML = "";
      this.body.appendChild(container);
    }
  },
);
