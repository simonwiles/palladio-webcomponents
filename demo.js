function getDataFromUrl(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        console.log("response", response);
        return renderError(`
          <pre>Error retrieving:\n\t${response.url}\n${response.status}: ${response.statusText}</pre>
        `);
      }
      return response.json();
    })
    .catch((response) => {
      return renderError(response);
    });
}

function renderError(error) {
  document.querySelector("#palladio-components").style.display = "none";
  const projectDetails = document.querySelector("#project-details");
  projectDetails.innerHTML = "";
  const errorMessage = document.createElement("p");
  errorMessage.classList.add("error-msg");
  errorMessage.innerHTML = error;
  projectDetails.appendChild(errorMessage);
}

function renderDetails(projectData) {
  // TODO: rewrite this completely, presumably
  const visTypesMap = {
    palladioFilters: "Filters",
    graphView: "Graph",
    mapView: "Map",
    tableView: "Table",
    listView: "Gallery",
  };

  const projectDetails = document.querySelector("#project-details");
  projectDetails.innerHTML = "";
  projectDetails.innerHTML = `
    <ul class="metadata">
      <li><span>Title:</span><span>${projectData.metadata.title}</span></li>
      <li><span>Author:</span><span>${projectData.metadata.author}</span></li>
      <li><span>Date:</span><span>${projectData.metadata.date}</span></li>
      <li><span>Palladio Version:</span><span>${projectData.version}</span></li>
      <li><span>Description:</span><span>${projectData.metadata.description}</span></li>
    </ul>
    <div><strong>Files:</strong><ul id="project-files" class="pills"></ul></div>
    <div><strong>Visualizations:</strong><ul id="project-visualizations" class="pills"></ul></div>
  `;

  projectFiles = projectDetails.querySelector("#project-files");
  projectData.files.forEach((file) => {
    const fileItem = document.createElement("li");
    fileItem.innerHTML = `${file.label} (${file.fields.length} fields, ${file.data.length} records)`;
    projectFiles.appendChild(fileItem);
  });
  projectVisualizations = projectDetails.querySelector(
    "#project-visualizations",
  );
  projectData.vis.forEach((vis) => {
    const visItem = document.createElement("li");
    visItem.innerHTML = `${visTypesMap[vis.type]}`;
    projectVisualizations.appendChild(visItem);
  });
}

function renderComponents(projectData) {
  if (!projectData) return;
  renderDetails(projectData);

  [
    {
      title: "Map",
      component: "palladio-map-component",
      conf: { width: 6, height: 6 },
    },
    {
      title: "Graph",
      component: "palladio-graph-component",
      conf: { width: 6, height: 6 },
    },
    {
      title: "Gallery",
      component: "palladio-cards-component",
      conf: { width: 12, height: 6 },
    },
  ].forEach((component) => {
    let widget = grid.addWidget(
      `<div><div class="grid-stack-item-content">
         <div class="drag-handle">
           <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.016 15v3h3l-5.016 5.016-5.016-5.016h3v-3h4.031zM23.016 12l-5.016 5.016v-3h-3v-4.031h3v-3zM9 9.984v4.031h-3v3l-5.016-5.016 5.016-5.016v3h3zM9.984 9v-3h-3l5.016-5.016 5.016 5.016h-3v3h-4.031z"/></svg>
           ${component.title}
           <span>✕</span>
         </div>
         <${component.component}></${component.component}>
       </div></div>`,
      component.conf,
    );
    widget.querySelector(component.component).render(projectData);
    widget
      .querySelector("span")
      .addEventListener("click", () => grid.removeWidget(widget));
  });
  window.scrollTo({
    behavior: "smooth",
    top: document.body.scrollHeight - window.innerHeight - 50,
  });
}

function handleLoadProjectExample(event) {
  const projectUrl = document.querySelector("#project-example").value;
  getDataFromUrl(projectUrl).then(renderComponents);
  event.target.blur();
}

function handleLoadProjectUrl(event) {
  const projectUrl = document.querySelector("#project-url").value;
  getDataFromUrl(projectUrl).then(renderComponents);
  event.target.blur();
}

function handleLoadProjectFile(event) {
  // clear the project-url attribute for the avoidance of confusion
  // (this is not otherwise necessary)
  document
    .querySelector("palladio-cards-component")
    .removeAttribute("project-url");

  const projectFile = document.querySelector("#project-file").files[0];
  const reader = new FileReader();

  reader.onload = (_event) => {
    projectData = JSON.parse(_event.target.result);
    renderComponents(projectData);
  };
  reader.readAsText(projectFile);
  event.target.blur();
}

document
  .querySelector("#load-project-example")
  .addEventListener("click", handleLoadProjectExample);

document
  .querySelector("#load-project-url")
  .addEventListener("click", handleLoadProjectUrl);

document.querySelector("#project-url").addEventListener("keypress", (event) => {
  if (event.key === "Enter") handleLoadProjectUrl(event);
});

document
  .querySelector("#load-project-file")
  .addEventListener("click", handleLoadProjectFile);

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", (e) => {
    document
      .querySelectorAll(".tab")
      .forEach((_tab) => _tab.classList.remove("active"));
    tab.classList.add("active");
    document
      .querySelectorAll(".tab-content")
      .forEach((tabContent) => tabContent.classList.remove("active"));
    document
      .querySelector(`#${tab.getAttribute("data-tab-id")}`)
      .classList.add("active");
  });
});

const grid = GridStack.init({
  resizable: {
    handles: "n, e, se, s, sw, w, nw",
  },
  handleClass: "drag-handle",
  alwaysShowResizeHandle: true,
  float: true,
  minRow: 4,
  animate: false,
});

grid.on("dragstart", function (event, ui) {
  const grid = this;
  // const element = event.target;
  grid.classList.add("dragging");
});

grid.on("dragstop", function (event, ui) {
  const grid = this;
  // const element = event.target;
  grid.classList.remove("dragging");
});
