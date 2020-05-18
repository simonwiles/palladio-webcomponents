class PalladioWebComponentAbstractBase extends HTMLElement {
  static get observedAttributes() {
    return ["height", "width", "project-url"];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === "project-url" && newValue !== null) {
      this.getDataFromUrl(newValue).then((data) => {
        if (data) this.render(data);
      });
    }
    if (["height", "width"].indexOf(attrName) !== -1) {
      this.style[attrName] = newValue;
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const { shadowRoot } = this;
    shadowRoot.innerHTML = "";

    const style = document.createElement("style");
    shadowRoot.appendChild(style);
    style.textContent = `
      :host { display: block; overflow: hidden; }
      body { height: 100%; width: 100%; margin: 0; }`;

    if (this.stylesheets) {
      let styling = document
        .createRange()
        .createContextualFragment(
          `${this.stylesheets
            .map(
              (stylesheet) =>
                `<link rel="stylesheet" type="text/css" href="${stylesheet}">`,
            )
            .join("\n")}`,
        );
      shadowRoot.appendChild(styling);
    }

    if (this.scripts) {
      this.scriptsReady = Promise.all(this.scripts.map(this.loadScript));
      this.scriptsReady.then(() => {
        // ResizeObserver was only rolled out in Safari and Safari/Chrome on iOS in
        //  March 2020, so probably needs to be polyfilled for the time being.
        if (this.onResize) {
          this.resizeObserver = new ResizeObserver(
            throttle(this.onResize.bind(this), 250),
          );
          this.resizeObserver.observe(this);
        }
      });
    }

    // working with a "body" element in the shadow root is necessary
    //  if styles from bootstrap are to work properly
    this.body = document.createElement("body");
    shadowRoot.appendChild(this.body);
  }

  disconnectedCallback() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      let script = document.querySelector(`head > script[src="${src}"]`);
      if (script !== null) {
        if (script.getAttribute("data-loaded") == "true") return resolve();
        script.addEventListener("load", resolve);
        script.addEventListener("error", reject);
        return;
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
    });
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
        return response.json();
      })
      .catch((response) => {
        // TODO: how do we end up here, what does the response look like, and what should the error message be?
        console.log("response", response);
        return this.renderError(response);
      });
  }

  getSettings(data, visType) {
    try {
      return data.vis.find((vis) => vis.type === visType).importJson;
    } catch (e) {
      return false;
    }
  }

  getFields(data) {
    // TODO: this is going to need to be able to handle multiple files in a project.
    try {
      return data.files[0].fields;
    } catch (e) {
      return false;
    }
  }

  getRows(data) {
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
}

const throttle = (fn, wait) => {
  let previouslyRun, queuedToRun;

  return function invokeFn(...args) {
    const now = Date.now();
    queuedToRun = clearTimeout(queuedToRun);
    if (!previouslyRun || now - previouslyRun >= wait) {
      fn.apply(null, args);
      previouslyRun = now;
    } else {
      queuedToRun = setTimeout(
        invokeFn.bind(null, ...args),
        wait - (now - previouslyRun),
      );
    }
  };
};

export default PalladioWebComponentAbstractBase;
