# Palladio Web Components

This is an exploratory attempt to redevelop from scratch a minimum viable subset of functionality for Palladio components in the form of modern ES6 web components.

The intention is that they will be published to NPM and CDNs such that they can be included easily with a single script tag and then used something like this:

```
<palladio-map-component project-url="my_project.palladio.1.2.9.json"></palladio-map-component>
```

See https://codepen.io/simonwiles/pen/yLYEKrW for an example, or https://palladio-webcomponents.netlify.app/ for a showcase site where you can test your own projects.

Once the components have something close to feature-parity with the original AngularJS-based modules it will be possible to look at adding additional functionality.

## Philosophy

## Current Status

### palladio-map-webcomponent

### palladio-graph-webcomponent

### palladio-cards-webcomponent

## Browser Support

Browser support is decent -- see https://caniuse.com/#feat=custom-elementsv1. Safari and iOS Safari/Chrome are fine, as are the Chinese QQ and Baidu browsers (these components use the "Autonomous custom elements" API, and do not make use of "Customized built-in elements"). [Polyfills are available](https://www.webcomponents.org/polyfills) if necessary.

### Automatic resizing with container

The map and graph components have the ability to automatically resize and recenter themselves when their container resizes. This functionality depends on the `ResizeObserver` and is silently disabled if it's not available. `ResizeObserver` has been [part of most browsers for many years but was only rolled out in Safari and Safari/Chrome for iOS in March 2020](https://caniuse.com/resizeobserver); if it is crucial to your page you'll need to include a `ResizeObserver` polyfill.

## Development

1. `git clone` this repository.

1. Run `yarn install` to install dependencies.

1. Build production versions of the components in `dist/` using `yarn build` (individual components can be built with `yarn build:map`, `yarn build:graph` etc.).

1. For a live-updating development build, use `yarn watch` (`yarn watch:map` etc. are available too).
