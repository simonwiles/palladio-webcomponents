window.customElements.define(
  "palladio-cards-component",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["project-url"];
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
      if (attrName === "project-url" && newValue !== oldValue) {
        this.render();
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
      shadowRoot.appendChild(document.createElement("body"));
      this.render();
    }

    _getData() {
      if ("project-url" in this.attributes) {
        return fetch(this.getAttribute("project-url"))
          .then((response) => {
            if (!response.ok) {
              this.dataError = true;
              return response.status;
            }
            this.dataError = false;
            return response.json();
          })
          .catch((response) => {
            this.dataError = true;
            return response;
          });
      } else return Promise.resolve(false);
    }

    render() {
      const body = this.shadowRoot.querySelector("body");
      body.innerHTML = "";
      this._getData().then((data) => {
        if (!data) {
          const noData = document.createElement("p");
          noData.innerHTML = "No Data!";
          body.appendChild(noData);
          return;
        }

        if (this.dataError) {
          const noData = document.createElement("p");
          noData.innerHTML = data;
          body.appendChild(noData);
          return;
        }

        const rows = data.files[0].data;
        const settings = data.vis.find((_vis) => _vis.type === "listView")
          .importJson;

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
          node.querySelector(".list-title").innerText =
            datum[settings.titleDim];
          node.querySelector(".list-subtitle").innerText =
            datum[settings.subtitleDim];
          node.querySelector(".list-text").innerText = datum[settings.textDim];
          row.appendChild(node);
        });

        body.appendChild(row);
      });
    }
  }
);
