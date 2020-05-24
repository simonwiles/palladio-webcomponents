
# Palladio Web Components
<a href="https://app.netlify.com/sites/palladio-webcomponents/deploys"><img src="https://api.netlify.com/api/v1/badges/0867bc87-5b80-4f24-a7e6-23bb73776371/deploy-status" align="right" alt="Netlify Status"></a>
https://palladio-webcomponents.netlify.app/

This is an exploratory attempt to redevelop from scratch a minimum viable subset of functionality for Palladio components in the form of modern ES6 web components.

The intention is that they will be published to NPM and CDNs such that they can be included easily with a single script tag and then used something like this:
```
<palladio-map-component project-url="my_project.palladio.1.2.9.json"></palladio-map-component>
```

See [https://codepen.io/simonwiles/pen/yLYEKrW](https://codepen.io/simonwiles/pen/yLYEKrW) for an example.

Once the components have something close to feature-parity with the original AngularJS-based modules it will be possible to look at adding additional functionality.

Browser support is decent (see https://caniuse.com/#feat=custom-elementsv1 -- Safari and iOS Safari/Chrome are fine), and [polyfills are available](https://www.webcomponents.org/polyfills) if necessary.
