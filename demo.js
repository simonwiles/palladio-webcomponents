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
    "#project-visualizations"
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
  document.querySelector("#palladio-components").style.display = "block";
  document.querySelector("palladio-cards-component").render(projectData);
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
  .querySelector("#load-project-url")
  .addEventListener("click", handleLoadProjectUrl);

document.querySelector("#project-url").addEventListener("keypress", (event) => {
  if (event.key === "Enter") handleLoadProjectUrl(event);
});

document
  .querySelector("#load-project-file")
  .addEventListener("click", handleLoadProjectFile);
