import "./style/index.scss";
import * as esriLoader from 'esri-loader';

const Promise = require('es6-promise').Promise;
const esriLoaderOptions = {
    url: 'https://js.arcgis.com/4.10'
};

// before using esri-loader, tell it to use the promise library if the Promise polyfill is being used
esriLoader.utils.Promise = Promise;

// first, we use Dojo's loader to require the map class
esriLoader.loadModules([
    'esri/views/MapView', 
    'esri/WebMap'
], esriLoaderOptions).then(([
    MapView, WebMap
]) => {
    // then we load a web map from an id
    var webmap = new WebMap({
        portalItem: { // autocasts as new PortalItem()
            id: 'f2e9b762544945f390ca4ac3671cfa72'
        }
    });

    // and we show that map in a container w/ id #viewDiv
    var view = new MapView({
        map: webmap,
        container: 'viewDiv'
    });
})
.catch(err => {
    // handle any errors
    console.error(err);
});