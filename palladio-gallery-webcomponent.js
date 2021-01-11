import galleryComponentStyles from "bundle-text:./palladio-gallery-webcomponent.css";
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
  "palladio-gallery-component",
  class extends PalladioWebComponentAbstractBase {
    constructor() {
      super();
      this.visType = "listView";
      this.inlineStylesheets = [galleryComponentStyles];
    }

    onDataLoaded() {
      const {
        imgurlDim,
        linkDim,
        sortDim,
        subtitleDim,
        textDim,
        titleDim,
      } = this.settings;

      const container = document.createElement("div");
      container.classList.add("palladio-gallery");

      if (sortDim) {
        // Need some logic here to sort on non-string types
        this.rows.sort((a, b) => a[sortDim].localeCompare(b[sortDim]));
      }

      this.rows.forEach((row) => {
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
