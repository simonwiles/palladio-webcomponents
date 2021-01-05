# Roadmap

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

### palladio-cards-webcomponent

- lazy-loading of images
- user-supplied template / styling
- sort and filter options?

## New Components

- A "higher-order" component that would allow integrating multiple components all visualizing the same dataset (depends on an extended Javascript API for the existing components).
- Facet / Timeline / Timespan components recreating the filters in the Palladio app (these would depend on the higher-order component).
- Possibly a table component? This should be fairly easy to achieve, and might be useful for some, especially if it was integrated and coordinated with other components.
