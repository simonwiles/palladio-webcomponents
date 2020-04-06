window.customElements.define(
  "palladio-cards-component",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["project-url"];
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
      if (attrName === "project-url" && newValue !== null) {
        this.getDataFromUrl(newValue).then((data) => {
          if (data) this.render(data);
        });
      }
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      const { shadowRoot } = this;
      shadowRoot.innerHTML = "";
      let styling = document.createRange().createContextualFragment(`
          <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css">
          <link rel="stylesheet" type="text/css" href="palladio-cards-webcomponent.css"></link>
        `);
      shadowRoot.appendChild(styling);

      // working with a "body" element in the shadow root is necessary
      //  if the bootstrap styles are to work properly
      this.body = document.createElement("body");
      shadowRoot.appendChild(this.body);
    }

    getDataFromUrl(url) {
      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            console.log("response", response);
            return this.renderError(`
                <pre>Error retrieving:\n\t${response.url}\n${response.status}: ${response.statusText}</pre>
              `);
          }
          this.dataError = false;
          return response.json();
        })
        .catch((response) => {
          console.log("response", response);
          return this.renderError(response);
        });
    }

    getSettings(data) {
      try {
        return data.vis.find((_vis) => _vis.type === "listView").importJson;
      } catch (e) {
        return false;
      }
    }

    getRows(data) {
      try {
        return data.files[0].data;
      } catch (e) {
        return false;
      }
    }

    renderError(error) {
      this.body.innerHTML = "";
      const errorMessage = document.createElement("p");
      errorMessage.classList.add("error-msg");
      errorMessage.innerHTML = error;
      this.body.appendChild(errorMessage);
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

      const settings = this.getSettings(data);
      if (!settings) {
        return this.renderError(`
        <details>
          <summary>Gallery Visualization not available!</summary>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `);
      }

      const defaultTemplate = `
        <div class="col-lg-3 col-md-4 col-sm-6 list-wrap">
          <a target="_blank" class="list-link">
            <div class="list-box">
              <div class="list-image"></div>
              <div class="list-title"></div>
              <div class="list-subtitle"></div>
              <div class="list-text margin-top"></div>
            </div>
          </a>
        </div>
        `;

      const row = document.createElement("div");
      row.classList.add("row");
      row.setAttribute("id", "list-display");

      if ("sortDim" in settings) {
        // Need some logic here to sort on non-string types
        rows.sort((a, b) =>
          a[settings.sortDim].localeCompare(b[settings.sortDim])
        );
      }

      rows.forEach((datum) => {
        let node = document
          .createRange()
          .createContextualFragment(defaultTemplate);
        node.querySelector(".list-link").href = datum[settings.linkDim];
        node.querySelector(".list-image").style.backgroundImage = `url(${
          datum[settings.imgurlDim]
        })`;
        node.querySelector(".list-title").innerText = datum[settings.titleDim];
        node.querySelector(".list-subtitle").innerText =
          datum[settings.subtitleDim];
        node.querySelector(".list-text").innerText = datum[settings.textDim];
        row.appendChild(node);
      });

      this.body.innerHTML = "";
      this.body.appendChild(row);
    }
  }
);
