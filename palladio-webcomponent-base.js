const throttle = (fn, wait) => {
  let previouslyRun;
  let queuedToRun;

  return function invokeFn(...args) {
    const now = Date.now();
    queuedToRun = clearTimeout(queuedToRun);
    if (!previouslyRun || now - previouslyRun >= wait) {
      fn(...args);
      previouslyRun = now;
    } else {
      queuedToRun = setTimeout(
        invokeFn.bind(null, ...args),
        wait - (now - previouslyRun),
      );
    }
  };
};

const baseComponentStyles = `
:host { display: block; overflow: hidden; }
body { height: 100%; width: 100%; margin: 0; }
.error-msg { margin: 0; padding: 1em; color: #d8000c; background-color: #ffbaba; height: 100%; }
`;

class PalladioWebcomponentBase extends HTMLElement {
  constructor() {
    super();
    if (new.target === PalladioWebcomponentBase) {
      throw new TypeError(
        `Cannot construct ${new.target.name} instances directly`,
      );
    }
    this.attachShadow({ mode: "open" });
    this.addEventListener("dataLoaded", this.onDataLoaded);
  }

  static get observedAttributes() {
    return ["height", "width", "project-url"];
  }

  connectedCallback() {
    if (this.visType === undefined) {
      throw new TypeError(
        "visType must be defined on classes derived from PalladioWebcomponentBase",
      );
    }

    const { shadowRoot } = this;
    shadowRoot.innerHTML = "";

    this.body = document.createElement("body");
    shadowRoot.appendChild(this.body);

    const style = document.createElement("style");
    shadowRoot.appendChild(style);
    style.textContent = baseComponentStyles;

    if (!this.projectUrl) {
      this.renderError('A "<code>project-url</code>" attribute is required!');
      return;
    }

    if (this.externalStylesheets) {
      const stylesheetLink = document
        .createRange()
        .createContextualFragment(
          `${this.externalStylesheets
            .map(
              (stylesheetUrl) =>
                `<link rel="stylesheet" type="text/css" href="${stylesheetUrl}">`,
            )
            .join("\n")}`,
        );
      shadowRoot.appendChild(stylesheetLink);
    }

    if (this.inlineStylesheets) {
      const styleTag = document.createElement("style");
      styleTag.textContent = this.inlineStylesheets.join("\n\n");
      this.shadowRoot.appendChild(styleTag);
    }

    if (this.externalScripts) {
      this.scriptsReady = Promise.all(
        this.externalScripts.map(this.constructor.loadScript),
      );
    } else {
      this.scriptsReady = Promise.resolve();
    }

    this.scriptsReady.then(() => {
      // ResizeObserver was only rolled out in Safari and Safari/Chrome on iOS in
      //  March 2020, so probably needs to be polyfilled for the time being if
      //  the behaviour is considered important.
      if (window.ResizeObserver && this.onResize) {
        this.resizeObserver = new ResizeObserver(
          throttle(this.onResize.bind(this), 250),
        );
        this.resizeObserver.observe(this);
      }
    });
  }

  disconnectedCallback() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.removeEventListener("dataLoaded", this.onDataLoaded);
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === "project-url" && newValue !== null) {
      this.getDataFromUrl().then((data) => this.parseData(data));
    }
    if (["height", "width"].indexOf(attrName) !== -1) {
      this.style[attrName] = newValue;
    }
  }

  get projectUrl() {
    return this.getAttribute("project-url");
  }

  set projectUrl(value) {
    this.setAttribute("project-url", value);
  }

  static loadScript(src) {
    return new Promise((resolve, reject) => {
      let script = document.querySelector(`head > script[src="${src}"]`);
      if (script !== null) {
        if (script.getAttribute("data-loaded") === "true") return resolve();
        script.addEventListener("load", resolve);
        script.addEventListener("error", reject);
        return true;
      }
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        script.setAttribute("data-loaded", true);
        resolve();
      };
      script.onerror = reject;
      return true;
    });
  }

  getDataFromUrl() {
    return fetch(this.projectUrl)
      .then((response) => {
        if (!response.ok) {
          this.renderError(`
          <pre>Error retrieving:\n\t${response.url}\n${response.status}: ${response.statusText}</pre>
          `);
          // eslint-disable-next-line no-console
          console.error("response", response);
          throw new Error();
        }
        return response.json();
      })
      .catch(() => {
        throw new Error("Unable to retrieve project JSON.");
      });
  }

  static getSettings(data, visType) {
    try {
      return data.vis.find((vis) => vis.type === visType).importJson;
    } catch (e) {
      return false;
    }
  }

  static getFields(data) {
    // TODO: this is going to need to be able to handle multiple files in a project.
    try {
      return data.files[0].fields;
    } catch (e) {
      return false;
    }
  }

  static getRows(data) {
    // TODO: this is going to need to be able to handle multiple files in a project.
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

  parseData(data) {
    if (!data || typeof data === "undefined") {
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
      throw new Error("Malformed project data!");
    }

    const settings = this.constructor.getSettings(data, this.visType);
    if (!settings) {
      this.renderError(`
      <details>
      <summary>Visualization type "${this.visType}" not available!</summary>
      <pre>${JSON.stringify(data, null, 2)}</pre>
      </details>
      `);
      throw new Error("Visualization settings not available!");
    }

    Object.assign(this, { rows, settings });
    this.dispatchEvent(new Event("dataLoaded"));
  }
}

export default PalladioWebcomponentBase;
