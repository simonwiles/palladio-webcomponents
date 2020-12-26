import PalladioWebComponentAbstractBase from "./palladio-webcomponent-abstract.js";

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

window.customElements.define(
  "palladio-map-component",
  class extends PalladioWebComponentAbstractBase {
    constructor() {
      super();
      this.stylesheets = ["https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"];
      this.scripts = ["https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"];

      this.mapConfig = {
        center: [45.464, 9.1916],
        zoom: 2,
        minZoom: 1,
        maxZoom: 20,
        minPointSize: 3,
        maxPointSize: 26,
        trackResize: false,
        accessToken:
          "pk.eyJ1IjoiY2VzdGEiLCJhIjoiMFo5dmlVZyJ9.Io52RcCMMnYukT77GjDJGA",
      };
    }

    connectedCallback() {
      super.connectedCallback();
      const style = document.createElement("style");
      this.shadowRoot.appendChild(style);
      style.textContent = `
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
    }

    static get observedAttributes() {
      return ["height", "width", "project-url", "zoom-to-fit"];
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
      if (attrName === "project-url" && newValue !== null) {
        this.getDataFromUrl(newValue).then((data) => {
          if (data) this.render(data);
        });
      }
      if (["height", "width"].indexOf(attrName) !== -1) {
        this.style[attrName] = newValue;
      }
      if (attrName === "zoom-to-fit" && newValue !== null) {
        this.isZoomToFit = true;
      }
    }

    onResize() {
      if (this.isZoomToFit) this.zoomToFit();
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

    addTileSets() {
      // iterate tile set layers in reverse order
      // (see palladio-map-view.js:1138)
      [...this.settings.tileSets].reverse().forEach((tileSet, i) => {
        if ("mbId" in tileSet && tileSet.mbId) {
          const layer = L.tileLayer(
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
              accessToken: this.mapConfig.accessToken,
              detectRetina: true,
            },
          ).addTo(this.map);
        }
        if ("wmsUrl" in tileSet) {
          const layer = L.tileLayer
            .wms(tileSet.wmsUrl, {
              layers: tileSet.wmsLayers,
              format: "image/png",
              transparent: true,
            })
            .addTo(this.map);
        }
      });
    }

    addLayers() {
      const { minPointSize, maxPointSize } = this.mapConfig;

      this.settings.layers.forEach((layer) => {
        if (layer.layerType === "data") {
          // create a pointsMap to group points by location
          let pointsMap = this.rows
            .filter((row) => row[layer.mapping.sourceCoordinatesKey])
            .reduce(
              (pointsMap, row) =>
                pointsMap.set(row[layer.mapping.sourceCoordinatesKey], [
                  ...(pointsMap.get(row[layer.mapping.sourceCoordinatesKey]) ||
                    []),
                  row,
                ]),
              new Map(),
            );

          if (layer.type === "point-to-point") {
            // if this is a point-to-point map, we need markers for the
            //  destination locations too
            pointsMap = this.rows
              .filter((row) => row[layer.mapping.destinationCoordinatesKey])
              .reduce(
                (pointsMap, row) =>
                  pointsMap.set(row[layer.mapping.destinationCoordinatesKey], [
                    ...(pointsMap.get(
                      row[layer.mapping.destinationCoordinatesKey],
                    ) || []),
                    row,
                  ]),
                pointsMap,
              );

            // and an edgesMap
            const edgesMap = this.rows
              .filter(
                (row) =>
                  row[layer.mapping.sourceCoordinatesKey] &&
                  row[layer.mapping.destinationCoordinatesKey] &&
                  !(
                    row[layer.mapping.sourceCoordinatesKey] ===
                    row[layer.mapping.destinationCoordinatesKey]
                  ),
              )
              .reduce(
                (edgesMap, row) =>
                  edgesMap.set(
                    [
                      row[layer.mapping.sourceCoordinatesKey],
                      row[layer.mapping.destinationCoordinatesKey],
                    ],
                    [
                      ...(edgesMap.get([
                        row[layer.mapping.sourceCoordinatesKey],
                        row[layer.mapping.destinationCoordinatesKey],
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
              }).addTo(this.map);
            });
          }

          const getAggregatedValue = (points) =>
            layer.aggregationType == "COUNT"
              ? // "COUNT" -- scale according to number of points
                points.length
              : // "SUM" -- scale according to sum of layer.aggregateKey properties
                points.reduce(
                  (a, b) => a + parseInt(b[layer.aggregateKey] || 0),
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
              .bindTooltip(
                "• " +
                  points
                    .map((point) => point[layer.descriptiveDimKey])
                    .join("<br>• ") +
                  `<br> [${points.length} record${
                    points.length > 1 ? "s" : ""
                  }]`,
                { className: "map-tooltip", direction: "top" },
              )
              .addTo(this.map);
          });
        }
      });

      if (this.isZoomToFit) this.zoomToFit();
    }

    zoomToFit() {
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
    }

    render(data) {
      if (!data) {
        return this.renderError("No Data!");
      }

      const rows = this.getRows(data);
      if (!rows) {
        return this.renderError(`
        <details>
          <summary>Malformed project data!</summary>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `);
      }

      const settings = this.getSettings(data, "mapView");
      if (!settings) {
        return this.renderError(`
        <details>
          <summary>Map Visualization not available!</summary>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `);
      }

      const view = document
        .createRange()
        .createContextualFragment(`<div class="map-view"></div>`);

      this.body.innerHTML = "";
      this.body.appendChild(view);
      this.body.querySelector("div.map-view").style.height = "100%";

      this.settings = settings;
      this.rows = rows;

      this.scriptsReady.then(() => {
        this.initMap();
        if ("tileSets" in settings) {
          this.addTileSets();
          this.addLayers();
        }
      });
    }
  },
);
