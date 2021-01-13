[![npm Version](https://img.shields.io/npm/v/palladio-webcomponents?logo=npm)](https://www.npmjs.com/package/palladio-webcomponents)
[![License](https://img.shields.io/github/license/simonwiles/palladio-webcomponents)](https://github.com/simonwiles/palladio-webcomponents/blob/main/LICENSE)

# Palladio Web Components

This is an exploratory attempt to redevelop from scratch a minimum viable subset of functionality for Palladio components in the form of modern ES6 web components.

See https://codepen.io/simonwiles/pen/yLYEKrW for an example, or https://palladio-webcomponents.netlify.app/ for a showcase site where you can test your own Palladio save files.

## Using Palladio Web Components in your pages

Palladio Web Components let you easily publish visualizations created with Palladio on your own pages.

Use the [Palladio application](http://hdlab.stanford.edu/palladio/) to upload your data and create your visualizations. (Palladio Web Components currently supports map, network, and gallery visualizations.) Click the “Download” button to save the project as a JSON file -- this file includes your data and the visualization settings. These web components then take this JSON file as an input and allow you to embed your visualizations on your own pages. For map visualizations, you will need to provide a [MapBox API token](https://docs.mapbox.com/accounts/guides/tokens/), which can be obtained at no cost for many kinds of projects.

### Basic Usage

To publish your visualization on a webpage, all you need to do is include the code for the component as a script tag, as described below, and add the component tag to your HTML.

All components take the following attributes:

**`project-url` (required):**  
The web accessible URL to your project `.json` file. It is likely that you'll want to upload your project file to the same place as your webpage, but any [CORS-enabled](https://www.w3.org/wiki/CORS_Enabled) hosting should do, including things like DropBox.

**`height` and `width` (optional):**  
You should specify a height and width for your visualization’s container. Depending on your page, this may be better done as part of your CSS; you can add a `style` attribute to the tag if needed. Any `height` and `width` attributes on the container tag itself will will take precedence over values from elsewhere.

### Gallery Component

The gallery component is a responsive grid of cards, like a gallery of images and/or metadata. Some user-styling is possible -- background and text styles can be set on the component element itself or inherited from block-level parents -- but the ability to use a custom template could possibly be added in the future. (See the [roadmap](ROADMAP.md) for details and other potential enhancements.)

Include the script with the following tag:

```
<script src="https://cdn.jsdelivr.net/npm/palladio-webcomponents@~0/palladio-gallery-webcomponent.js"></script>
```

Put the HTML wherever you want it to appear on your page:

```
<palladio-gallery
  height="600px" width="900px"
  project-url="<path-to-your-project.json>">
</palladio-gallery>
```

### Graph Component

Include the script with the following tag:

```
<script src="https://cdn.jsdelivr.net/npm/palladio-webcomponents@~0/palladio-graph-webcomponent.js"></script>
```

Put the HTML wherever you want it to appear on your page:

```
<palladio-graph
  height="600px" width="900px"
  project-url="<path-to-your-project.json>">
</palladio-graph>
```

### Map Component

Include the script with the following tag:

```
<script src="https://cdn.jsdelivr.net/npm/palladio-webcomponents@~0/palladio-map-webcomponent.js"></script>
```

Put the HTML wherever you want it to appear on your page:

```
<palladio-map
  height="600px" width="900px"
  zoom-to-fit
  mapbox-token="<your-mapbox-API-token-goes-here>"
  project-url="<path-to-your-project.json>">
</palladio-map>
```

`<palladio-map>` takes the following additional attributes, as shown in the example above:

**`mapbox-token`** (required):  
To use the base map tilesets you will need to supply your own [MapBox API access token](https://docs.mapbox.com/accounts/guides/tokens/). [Getting a token](https://docs.mapbox.com/accounts/guides/) is free and pretty easy, and a lot of usage is covered by the free tier (more than enough for the vast majority of projects).

**`zoom-to-fit` (optional):**  
With this (valueless) attribute supplied, the map will zoom to the contents of the data layer when the component first loads, and any time the container resizes for any reason. Without it, the map will initialize showing the whole map.

## Versioning

Releases for this project will adhere to the Semantic Versioning ("SemVer") specification. This means that version numbers will be of the form `x.y.z` (commonly referred to as `major.minor.patch`).

- Increments to `z` indicate bug fix releases -- it is always advisable to be using the most up-to-date `patch` release.
- Releases that add new features that are backwards compatible will increment `y`, the `minor` version. These updates will add new functionally and may enhance or otherwise alter existing functionality, but will not break existing deploys.
- New `major` releases that increment `z` are likely to contain breaking changes of one sort or another -- if you upgrade to a new `major` version you should check for release notes and test your visualizations to be sure they still work as expected.

To be notified of new releases you can subscribe to ”watch” this GitHub repo.

### Suggested Use with the CDN

If you include the CDN links in `<script>` tags as recommended, you can take advantage of automatic updating at the level you wish. In tags of the form:

```
<script src="https://cdn.jsdelivr.net/npm/palladio-webcomponents@<version>/palladio-map-webcomponent.js"></script>
```

you can replace `<version>` with a tag to indicate the release(s) you want. For example `@0.5.0` will get exactly that version, with no upgrades accepted. If you choose to omit `z` (e.g. `@0.5`) your page will automatically get the most recent `patch` release and stay up-to-date with any bug fixes (this is strongly advised). If you choose also to omit `y`, (e.g. just `@0`) you will automatically upgrade to all future backwards-compatible releases (in this case, new versions until we decide to do a `v1.0`). This is up to you -- we would recommend this (there are likely to be improvements, we undertake to ensure that these releases won’t break existing deployments, and we do not guarantee that all future bug fixes will be backported to all `minor` releases), but there may be minor aesthetic changes made, and if you’re happy with how it works with the current version and want to lock it down, you are free to do so. Older versions will not be removed from the CDN hosting at any stage.

## Browser Support

Browser support includes all modern browsers. Note that this does not include IE11, although Edge is fine. (it would probably be possible to make an IE11-compatible build with some additional transpilation and polyfills).

### Automatically resizing with the parent container

The map and graph components have the ability to automatically resize and recenter themselves when their container resizes (typically when the browser window is resized). This functionality depends on the `ResizeObserver` and is silently disabled if it's not available. `ResizeObserver` has been [part of most browsers for many years but was only rolled out in Safari and Safari/Chrome for iOS in March 2020](https://caniuse.com/resizeobserver); if it is crucial to your page you'll need to include a `ResizeObserver` polyfill.

## Development

1. `git clone` this repository.

1. Run `yarn install` to install dependencies.

1. Build production versions of the components in `dist/` using `yarn build` (individual components can be built with `yarn build:map`, `yarn build:graph` etc.).

1. For a live-updating development build, use `yarn watch` (`yarn watch:map` etc. are available too).
