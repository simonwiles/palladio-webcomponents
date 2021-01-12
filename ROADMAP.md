# Roadmap

The initial version of Palladio Web Components (v0.5.x) supports simple display of map, graph, and gallery visualizations stored in a Palladio save file. There are many possible ways to improve and expand Palladio Web Components, and we've included a few ideas below.

If you'd like to help work on one, please get in touch by filing an issue on this repo! And if any one of these features is a higher priority for your project, please also file an issue. Palladio Web Components is a side project, and bugs in current functionality will be prioritized.

## General / Base Functionality

- [missing feature:] Correct parsing of projects with multiple tables and joins
- Extended Javascript API
  - for those who might want to control the components from JS, but also to facilitate multi-component integration
- Export current view to PNG/SVG?

## Existing Components

### Map

- [missing feature:] Handle projects with multiple data layers
- Re-center / zoom button(s)?
- Optional legend for sized nodes

### Graph

- Re-center / zoom button(s)?
- Optional legend for sized nodes

### Gallery

- Lazy-loading of images
- Spinner for loading images (multiple images from third-party sites can take a while...)
- User-supplied template / styling
- Sort and filter options?

## New Components

- A "higher-order" component that would allow integrating multiple components all visualizing the same dataset (depends on an extended Javascript API for the existing components).
- Facet / Timeline / Timespan components recreating the filters in the Palladio app (these would depend on the higher-order component).
- Possibly a table component? This should be fairly easy to achieve, and might be useful for some, especially if it was integrated and coordinated with other components.

## Longer Term

The creation of a "higher-order" component of the kind described above would open the possibility for a new project creation site to replace the existing Palladio application. The existing site is difficult to maintain and forbidding to new contributors, and a new, simplified and more modern architecture would afford the opportunity to address some long-standing bugs and feature requests.
