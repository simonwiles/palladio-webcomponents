# Using Palladio Web Components in your pages

Palladio Web Components let you easily publish visualizations created with Palladio on your own pages.

Use the [Palladio application](http://hdlab.stanford.edu/palladio/) to upload your data and create your visualizations. (Palladio Web Components currently supports map, network, and gallery visualizations.) Click the "Download" button to save the project as a JSON file -- this file includes your data and the visualization settings. These web components then take this JSON file as an input and allow you to embed your visualizations on your own pages. For map visualizations, you will need to provide a [MapBox API token](https://docs.mapbox.com/accounts/guides/tokens/), which can be obtained at no cost for many kinds of projects.

## Basic Usage

To publish your visualization on a webpage, all you need to do is include the code for the component as a script tag, as described below, and add the component tag to your HTML.

All components take the following attributes:

**`project-url` (required):**  
The web accessible URL to your project `.json` file. It is likely that you'll want to upload your project file to the same place as your webpage, but any [CORS-enabled](https://www.w3.org/wiki/CORS_Enabled) hosting should do, including things like DropBox.

**`height` and `width` (optional):**  
You should specify a height and width for your visualization's container. Depending on your page, this may be better done as part of your CSS; you can add a `style` attribute to the tag if needed. Any `height` and `width` attributes on the container tag itself will will take precedence over values from elsewhere.


## Gallery Component

The gallery component is a responsive grid of cards, like a gallery of images and/or metadata. Some user-styling is possible -- background and text styles can be set on the component element itself or inherited from block-level parents -- but the ability to use a custom template could possibly be added in the future. (See the [roadmap](roadmap.md) for details and other potential enhancements.)

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

`<palladio-map-component>` takes the following additional attributes, as shown in the example above:

**`mapbox-token`** (required):  
To use the base map tilesets you will need to supply your own [MapBox API access token](https://docs.mapbox.com/accounts/guides/tokens/). [Getting a token](https://docs.mapbox.com/accounts/guides/) is free and pretty easy, and a lot of usage is covered by the free tier (more than enough for the vast majority of projects).

**`zoom-to-fit` (optional):**  
With this (valueless) attribute supplied, the map will zoom to the contents of the data layer when the component first loads, and any time the container resizes for any reason. Without it, the map will initialize showing the whole map.
