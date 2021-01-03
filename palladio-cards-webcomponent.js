import cardsComponentStyles from "bundle-text:./palladio-cards-webcomponent.css";
import PalladioWebComponentAbstractBase from "./palladio-webcomponent-abstract.js";

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

      const container = document.createElement("div");
      container.classList.add("palladio-cards");

      if ("sortDim" in settings) {
        // Need some logic here to sort on non-string types
        rows.sort((a, b) =>
          a[settings.sortDim].localeCompare(b[settings.sortDim]),
        );
      }

      rows.forEach((row) => {
        const node = document
          .createRange()
          .createContextualFragment(defaultTemplate);
        if (row[settings.linkDim])
          node.querySelector(".link").href = row[settings.linkDim];
        if (row[settings.imgurlDim])
          node.querySelector(".image").style.backgroundImage = `url(${
            row[settings.imgurlDim]
          })`;
        node.querySelector(".title").innerText = row[settings.titleDim];
        node.querySelector(".subtitle").innerText = row[settings.subtitleDim];
        node.querySelector(".text").innerText = row[settings.textDim];
        container.appendChild(node);
      });

      this.body.innerHTML = "";
      this.body.appendChild(container);
    }
  },
);
