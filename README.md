[![npm Version](https://img.shields.io/npm/v/palladio-webcomponents?logo=npm)](https://www.npmjs.com/package/palladio-webcomponents)
[![License](https://img.shields.io/github/license/simonwiles/palladio-webcomponents)](https://github.com/simonwiles/palladio-webcomponents/blob/main/LICENSE)

# Palladio Web Components

This is an exploratory attempt to redevelop from scratch a minimum viable subset of functionality for Palladio components in the form of modern ES6 web components.

The intention is that they will be published to NPM and CDNs such that they can be included easily with a single script tag and then used something like this:

```
<palladio-map project-url="my_project.palladio.1.2.9.json"></palladio-map>
```

See https://codepen.io/simonwiles/pen/yLYEKrW for an example, or https://palladio-webcomponents.netlify.app/ for a showcase site where you can test your own projects.

Once the components have something close to feature-parity with the original AngularJS-based modules it will be possible to look at adding additional functionality.

Browser support is decent (see https://caniuse.com/#feat=custom-elementsv1 -- Safari and iOS Safari/Chrome are fine), and [polyfills are available](https://www.webcomponents.org/polyfills) if necessary.

## Development

1. `git clone` this repository.

1. Run `yarn install` to install dependencies.

1. Build production versions of the components in `dist/` using `yarn build` (individual components can be built with `yarn build:map`, `yarn build:graph` etc.).

1. For a live-updating development build, use `yarn watch` (`yarn watch:map` etc. are available too).
