# Using Palladio Web Components in your pages

Palladio Web Components let you publish visualizations created with Palladio on your own pages with a minimum of fuss.

Use the Palladio application to upload your data and create your visualizations. Click the "Download" button to save the project as a JSON file -- this file includes your data and the visualization settings. These Web Components then take this JSON file as an input and allow you to embed your visualizations on your own pages.

## Basic Usage

To publish your visualization on another page, all you need to do is include the code for the component as a script tag, and add the component tag to your HTML.

All components take the following attributes:

**`project-url` (required):**  
The web accessible URL to your project `.json` file. It is likely that you'll want to upload your project file to the same place as your webpage, but any CORS-enabled hosting should do, including things like DropBox, should that suit your needs.

**`height` and `width` (optional):**  
You should specify a height and width for your visualization's container. Depending on your page, this may be better done with CSS or in whatever way you prefer to style your HTML elements, but `height` and `width` can be specified directly as attributes on the component tag if desired, and these values will take precedence over values from elsewhere. (You can also use a plain old `style` attribute on the tag too, if you must.)

## Cards Component

The cards component is a responsive grid of cards. Some user-styling is possible -- background and text styles can be set on the component element itself or inherited from block-level parents -- but the ability to use a custom template could possible be added.

Include the script with the following tag:

```
<script src="https://unpkg.com/palladio-webcomponents@0.4/palladio-cards-webcomponent.js"></script>
```

Put the HTML wherever you want it to appear on your page:

```
<palladio-cards-component
  height="600px" width="900px"
  project-url="<path-to-your-project.json>">
</palladio-cards-component>
```

## Graph Component

Include the script with the following tag:

```
<script src="https://unpkg.com/palladio-webcomponents@0.4/palladio-graph-webcomponent.js"></script>
```

Put the HTML wherever you want it to appear on your page:

```
<palladio-graph-component
  height="600px" width="900px"
  project-url="<path-to-your-project.json>">
</palladio-graph-component>
```

## Map Component

Include the script with the following tag:

```
<script src="https://unpkg.com/palladio-webcomponents@0.4/palladio-map-webcomponent.js"></script>
```

Put the HTML wherever you want it to appear on your page:

```
<palladio-map-component
  height="600px" width="900px"
  zoom-to-fit
  mapbox-token="<your-mapbox-API-token-goes-here>"
  project-url="<path-to-your-project.json>">
</palladio-map-component>
```

`<palladio-map-component>` takes the following additional attributes:

**`mapbox-token`** (required):  
To use the base map tilesets you will need to supply your own MapBox API access token. Getting a token is free and pretty easy, and a lot of usage is covered by the free tier (more than enough for all but the most immodest of projects).

**`zoom-to-fit` (optional):**  
With this (valueless) attribute supplied, the map will zoom to the contents of the data layer when the component first loads, and any time the container resizes for any reason. Without it, the map will initialize showing the whole map.
