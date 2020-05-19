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
           <svg id="move" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.016 15v3h3l-5.016 5.016-5.016-5.016h3v-3h4.031zM23.016 12l-5.016 5.016v-3h-3v-4.031h3v-3zM9 9.984v4.031h-3v3l-5.016-5.016 5.016-5.016v3h3zM9.984 9v-3h-3l5.016-5.016 5.016 5.016h-3v3h-4.031z"/></svg>
           ${component.title}
           <svg id="full-screen" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M883 1056q0 13-10 23l-332 332 144 144q19 19 19 45t-19 45-45 19h-448q-26 0-45-19t-19-45v-448q0-26 19-45t45-19 45 19l144 144 332-332q10-10 23-10t23 10l114 114q10 10 10 23zm781-864v448q0 26-19 45t-45 19-45-19l-144-144-332 332q-10 10-23 10t-23-10l-114-114q-10-10-10-23t10-23l332-332-144-144q-19-19-19-45t19-45 45-19h448q26 0 45 19t19 45z"/></svg>
           <svg id="exit-full-screen" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M896 960v448q0 26-19 45t-45 19-45-19l-144-144-332 332q-10 10-23 10t-23-10l-114-114q-10-10-10-23t10-23l332-332-144-144q-19-19-19-45t19-45 45-19h448q26 0 45 19t19 45zm755-672q0 13-10 23l-332 332 144 144q19 19 19 45t-19 45-45 19h-448q-26 0-45-19t-19-45v-448q0-26 19-45t45-19 45 19l144 144 332-332q10-10 23-10t23 10l114 114q10 10 10 23z"/></svg>
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
    widget
      .querySelector("svg#full-screen")
      .addEventListener("click", () => makeFullscreen(widget));
    widget
      .querySelector("svg#exit-full-screen")
      .addEventListener("click", () => exitFullscreen());
  });
  window.scrollTo({
    behavior: "smooth",
    top: document.body.scrollHeight - window.innerHeight - 50,
  });
}

function makeFullscreen(widget) {
  const widgetContent = widget.querySelector(".grid-stack-item-content");
  if (widgetContent.requestFullscreen) {
    widgetContent.requestFullscreen();
  } else if (widgetContent.webkitRequestFullscreen) {
    widgetContent.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
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

grid.on("dragstart", (event, ui) =>
  event.currentTarget.classList.add("dragging"),
);
grid.on("dragstop", (event, ui) =>
  event.currentTarget.classList.remove("dragging"),
);

!(document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
  document.documentElement.setAttribute("data-fullscreen", false);
