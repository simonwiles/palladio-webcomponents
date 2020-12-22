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
        trackResize: false,
        accessToken:
          "pk.eyJ1IjoiY2VzdGEiLCJhIjoiMFo5dmlVZyJ9.Io52RcCMMnYukT77GjDJGA",
      };
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
      this.settings.layers.forEach((layer) => {
        if (layer.layerType === "data") {
          this.rows.forEach((row) => {
            L.circle(row[layer.mapping.sourceCoordinatesKey].split(","), {
              color: layer.color,
              fillColor: layer.color,
              fillOpacity: 0.5,
              radius: 100,
            })
              .bindPopup(row[layer.descriptiveDimKey])
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
