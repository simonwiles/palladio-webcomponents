# Roadmap

The initial version of Palladio Components (v. 0.?) supports simple display of map, graph, and gallery visualizations stored in a Palladio save file. There are many possible ways to improve and expand Palladio Components, and we've included a few ideas below.

If you'd like to help work on one, please get in touch by filing an issue on this repo! And if any one of these features is a higher priority for your project, please also file an issue. Palladio Components is a side project, and bugs in current functionality will be prioritized.

## General / Base Functionality

- Correct parsing of projects with multiple tables and joins
- Extended Javascript API
  - for those who might want to control the components from JS, but also to facilitate multi-component integration
- Export to PNG/PDF/SVG?

## Existing Components

### palladio-map-webcomponent

- re-center / zoom button(s)?
- (optional) legend for sized nodes

### palladio-graph-webcomponent

- re-center / zoom button(s)?
- (optional) legend for sized nodes

### palladio-gallery-webcomponent

- lazy-loading of images
- user-supplied template / styling
- sort and filter options?

## New Components

- A "higher-order" component that would allow integrating multiple components all visualizing the same dataset (depends on an extended Javascript API for the existing components).
- Facet / Timeline / Timespan components recreating the filters in the Palladio app (these would depend on the higher-order component).
- Possibly a table component? This should be fairly easy to achieve, and might be useful for some, especially if it was integrated and coordinated with other components.
