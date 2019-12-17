import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {Tile3DLayer} from '@deck.gl/geo-layers';

import {registerLoaders} from '@loaders.gl/core';
// To manage dependencies and bundle size, the app must decide which supporting loaders to bring in
import {DracoWorkerLoader} from '@loaders.gl/draco';

registerLoaders([DracoWorkerLoader]);
// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWMxMzcyYy0zZjJkLTQwODctODNlNi01MDRkZmMzMjIxOWIiLCJpZCI6OTYyMCwic2NvcGVzIjpbImFzbCIsImFzciIsImdjIl0sImlhdCI6MTU2Mjg2NjI3M30.1FNiClUyk00YH_nWfSGpiQAjR5V2OvREDq1PJ5QMjWQ';

const INITIAL_VIEW_STATE = {
  latitude: 40,
  longitude: -75,
  pitch: 45,
  maxPitch: 60,
  bearing: 0,
  minZoom: 2,
  maxZoom: 30,
  zoom: 17
};

export default class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      attributions: []
    };

    this._deckRef = React.createRef();
    this._onTilesetLoad = this._onTilesetLoad.bind(this);
  }

  // Called by Tile3DLayer when a new tileset is loaded
  _onTilesetLoad(tileset) {
    this.setState({attributions: tileset.credits.attributions});
    this._centerViewOnTileset(tileset);
    if (this.props.updateAttributions) {
      this.props.updateAttributions(tileset.credits.attributions);
    }
  }

  // Recenter view to cover the new tileset, with a fly-to transition
  _centerViewOnTileset(tileset) {
    const {cartographicCenter, zoom} = tileset;
    this._deckRef.current.setViewState({
      ...INITIAL_VIEW_STATE,

      // Update deck.gl viewState, moving the camera to the new tileset
      longitude: cartographicCenter[0],
      latitude: cartographicCenter[1],
      zoom: zoom + 1.5 // TODO - remove adjustment when Tileset3D calculates correct zoom
    });
  }

  _renderTile3DLayer() {
    return new Tile3DLayer({
      id: 'tile-3d-layer',
      _ionAssetId: 43978,
      _ionAccessToken: ION_TOKEN,
      pointSize: 2,
      onTilesetLoad: this._onTilesetLoad
    });
  }

  render() {
    const tile3DLayer = this._renderTile3DLayer();
    const {mapStyle = 'mapbox://styles/uberdata/cive485h000192imn6c6cc8fc'} = this.props;

    return (
      <div>
        <DeckGL
          ref={this._deckRef}
          layers={[tile3DLayer]}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        >
          <StaticMap mapStyle={mapStyle} mapboxApiAccessToken={MAPBOX_TOKEN} preventStyleDiffing />
        </DeckGL>
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
