import leafletBaseStyles from "bundle-text:leaflet/dist/leaflet.css";
import * as L from "leaflet/dist/leaflet-src.esm.js";
import PalladioWebcomponentBase from "./palladio-webcomponent-base.js";

const mapboxStylesMap = {
  // Maps IDs from old "Classic" style mapbox tileset to IDs for newly created
  //  "modern" tilesets that are more-or-less equivalent.
  // (Saved projects will reference these, so they need to be supported.)
  "cesta.hd9ak6ie": "cesta/ckg1piv57010w19putr06104b", // "Land"
  "cesta.k8gof2np": "mapbox/satellite-v9", // "Satellite"
  "cesta.k8m9p19p": "cesta/ckg1qp80v02631apq1amjacri", // "Streets"
  "cesta.k8ghh462": "cesta/ckg2j7auf0tyz19s2fqt7o07n", // "Terrain"
  "cesta.k8g7eofo": "cesta/ckg2k36b80upx19pua1dy7y4z", // "Buildings and Areas"
};

const tooltipStyleOverrides = `
  .map-tooltip {
    background: rgba(0,0,0,.8);
    border: 0;
    border-radius: 2px;
    color: #fff;
  }

  .map-tooltip.leaflet-tooltip-top:before { border-top-color: rgba(0,0,0,.8); }
  .map-tooltip.leaflet-tooltip-right:before { border-right-color: rgba(0,0,0,.8); }
  .map-tooltip.leaflet-tooltip-bottom:before { border-bottom-color: rgba(0,0,0,.8); }
  .map-tooltip.leaflet-tooltip-left:before { border-left-color: rgba(0,0,0,.8); }
`;

window.customElements.define(
  "palladio-map",
  class extends PalladioWebcomponentBase {
    constructor() {
      super();
      this.visType = "mapView";

      this.inlineStylesheets = [leafletBaseStyles, tooltipStyleOverrides];

      this.mapConfig = {
        center: [45.464, 9.1916],
        zoom: 2,
        minZoom: 1,
        maxZoom: 20,
        minPointSize: 3,
        maxPointSize: 26,
        trackResize: false,
      };

      // the ResizeObserver that dispatches .onResize fires immediately on creation,
      //  typically before the graph is drawn and the .zoomToFit function is ready.
      this.doZoomToFit = () => {};
    }

    static get observedAttributes() {
      return [...super.observedAttributes, "mapbox-token", "zoom-to-fit"];
    }

    get zoomToFit() {
      return this.hasAttribute("zoom-to-fit");
    }

    set zoomToFit(value) {
      const isChecked = Boolean(value);
      if (isChecked) this.setAttribute("zoom-to-fit", "");
      else this.removeAttribute("zoom-to-fit");
    }

    get mapboxAccessToken() {
      return this.getAttribute("mapbox-token");
    }

    set mapboxAccessToken(value) {
      this.setAttribute("mapbox-token", value);
    }

    onResize() {
      if (this.zoomToFit) this.doZoomToFit();
    }

    initMap() {
      this.element = this.body.querySelector("div.map-view");

      this.map = L.map(this.element).setView(
        new L.LatLng(...this.mapConfig.center),
        this.mapConfig.zoom,
      );

      this.map.attributionControl.addAttribution(
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      );
      L.control.scale().addTo(this.map);
    }

    addTileSets(tileSets) {
      // iterate tile set layers in reverse order
      [...tileSets].reverse().forEach((tileSet) => {
        if ("mbId" in tileSet && tileSet.mbId) {
          L.tileLayer(
            // The Palladio tilesets have been migrated to MapBox's "Static Tiles API".
            // see: https://docs.mapbox.com/api/maps/#static-tiles
            "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}@2x?access_token={accessToken}",
            {
              maxZoom: this.mapConfig.maxZoom,
              minZoom: this.mapConfig.minZoom,
              id: Object.prototype.hasOwnProperty.call(
                mapboxStylesMap,
                tileSet.mbId,
              )
                ? mapboxStylesMap[tileSet.mbId]
                : tileSet.mbId,
              tileSize: 512,
              zoomOffset: -1,
              accessToken: this.mapboxAccessToken,
              detectRetina: true,
            },
          ).addTo(this.map);
        }
        if ("wmsUrl" in tileSet) {
          L.tileLayer
            .wms(tileSet.wmsUrl, {
              layers: tileSet.wmsLayers,
              format: "image/png",
              transparent: true,
            })
            .addTo(this.map);
        }
      });
    }

    addLayers(layers) {
      const { minPointSize, maxPointSize } = this.mapConfig;

      layers
        .filter(({ layerType }) => layerType === "data")
        .forEach((layer) => {
          // destructure some properties into the local scope
          const { sourceCoordinatesKey, destinationCoordinatesKey } =
            layer.mapping;

          const tooltipText = (points) =>
            `• ${[
              ...new Set(points.map((point) => point[layer.descriptiveDimKey])),
            ].join("<br>• ")}<br> [${points.length} record${
              points.length > 1 ? "s" : ""
            }]`;

          // create a pointsMap to group points by location
          //  Map() {<coords> => [ <row>, ... ] }
          let pointsMap = this.rows
            .filter((row) => row[sourceCoordinatesKey])
            .reduce(
              (_pointsMap, row) =>
                _pointsMap.set(row[sourceCoordinatesKey], [
                  ...(_pointsMap.get(row[sourceCoordinatesKey]) || []),
                  row,
                ]),
              new Map(),
            );

          if (layer.type === "point-to-point") {
            // if this is a point-to-point map, we need markers for the
            //  destination locations too
            pointsMap = this.rows
              .filter((row) => row[destinationCoordinatesKey])
              .reduce(
                (_pointsMap, row) =>
                  _pointsMap.set(row[destinationCoordinatesKey], [
                    ...(_pointsMap.get(row[destinationCoordinatesKey]) || []),
                    row,
                  ]),
                pointsMap,
              );

            // and an edgesMap
            //  Map() {[<sourceCoords>, <destCoords>] => [ <row>, ... ] }
            const edgesMap = this.rows
              .filter(
                // only rows that have a source *and* a destination
                //  (that are not the same) create edges
                (row) =>
                  row[sourceCoordinatesKey] &&
                  row[destinationCoordinatesKey] &&
                  !(
                    row[sourceCoordinatesKey] === row[destinationCoordinatesKey]
                  ),
              )
              .reduce(
                (_edgesMap, row) =>
                  _edgesMap.set(
                    [row[sourceCoordinatesKey], row[destinationCoordinatesKey]],
                    [
                      ...(_edgesMap.get([
                        row[sourceCoordinatesKey],
                        row[destinationCoordinatesKey],
                      ]) || []),
                      row,
                    ],
                  ),
                new Map(),
              );

            edgesMap.forEach((points, [sourceCoords, targetCoords]) => {
              L.polyline([sourceCoords.split(","), targetCoords.split(",")], {
                color: "rgba(102,102,102,.2)",
                weight: 2,
                smoothFactor: 1,
              })
                .bindTooltip(tooltipText(points), {
                  className: "map-tooltip",
                  direction: "top",
                })
                .addTo(this.map);
            });
          }

          const getAggregatedValue = (points) =>
            layer.aggregationType === "COUNT"
              ? // "COUNT" -- scale according to number of points
                points.length
              : // "SUM" -- scale according to sum of layer.aggregateKey properties
                points.reduce(
                  (a, b) => a + parseInt(b[layer.aggregateKey] || 0, 10),
                  0,
                );

          const maxValue = Math.max(
            ...Array.from(pointsMap.values()).map((points) =>
              getAggregatedValue(points),
            ),
          );
          const minValue = 1;

          const scale = (value) =>
            ((maxPointSize - minPointSize) * (value - minValue)) /
              (maxValue - minValue) +
            minPointSize;

          pointsMap.forEach((points, coords) => {
            L.circleMarker(coords.split(","), {
              stroke: false,
              fillColor: layer.color,
              fillOpacity: 0.8,
              radius: layer.pointSize
                ? scale(getAggregatedValue(points))
                : minPointSize,
            })
              .bindTooltip(tooltipText(points), {
                className: "map-tooltip",
                direction: "top",
              })
              .addTo(this.map);
          });
        });
    }

    onDataLoaded() {
      if (!this.mapboxAccessToken) {
        this.renderError(
          'A "<code>mapbox-token</code>" attribute is required!',
        );
        return;
      }

      const view = document
        .createRange()
        .createContextualFragment(`<div class="map-view"></div>`);

      this.body.innerHTML = "";
      this.body.appendChild(view);
      this.body.querySelector("div.map-view").style.height = "100%";

      this.doZoomToFit = () => {
        // this needs to be more sophisticated if there are multiple data layers
        const dataLayers = this.settings.layers.filter(
          (layer) => layer.layerType === "data",
        );
        if (dataLayers) {
          this.map.invalidateSize();
          this.map.fitBounds(
            this.rows.map((row) =>
              row[dataLayers[0].mapping.sourceCoordinatesKey].split(","),
            ),
          );
        }
      };

      this.initMap();
      if ("tileSets" in this.settings) {
        this.addTileSets(this.settings.tileSets);
        this.addLayers(this.settings.layers);
      }
      if (this.zoomToFit) this.doZoomToFit();
    }
  },
);
