// load a project from a URL
// Note: the "project-url" attribute on components is intended for use
//       in HTML.  If you're loading your own data via javascript you'd
//       probably use the other method -- this is just for the demo.
document
  .querySelector("#load-project-url")
  .addEventListener("click", (event) => {
    const projectUrl = document.querySelector("#project-url").value;
    document
      .querySelector("palladio-cards-component")
      .setAttribute("project-url", projectUrl);
    event.target.blur();
  });

// load a project from a local file
document
  .querySelector("#load-project-file")
  .addEventListener("click", (event) => {
    // clear the project-url attribute for the avoidance of confusion
    // (this is not otherwise necessary)
    document
      .querySelector("palladio-cards-component")
      .removeAttribute("project-url");

    const projectFile = document.querySelector("#project-file").files[0];
    const reader = new FileReader();

    reader.onload = (_event) => {
      projectData = JSON.parse(_event.target.result);
      document.querySelector("palladio-cards-component").render(projectData);
    };
    reader.readAsText(projectFile);

    event.target.blur();
  });
