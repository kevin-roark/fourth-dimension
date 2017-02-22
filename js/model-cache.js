
let THREE = require('three');

let textureLoader = new THREE.TextureLoader();
let jsonLoader = new THREE.JSONLoader();

let cache = {};

export default function load (photo, callback) {
  let cacheKey = `${photo.seriesPath}/${photo.path}`;
  let cached = cache[cacheKey];
  if (cached) {
    callback(cached);
    return;
  }

  let model = { geometry: null, texture: null };
  let loaded = () => {
    if (!model.geometry || !model.texture) {
      return;
    }

    cache[cacheKey] = model;
    callback(model);
  };

  let texturePath = `models/${photo.seriesPath}/${photo.path}/Model.jpg`;
  textureLoader.load(texturePath, texture => {
    model.texture = texture;
    loaded();
  });

  let jsonPath = `models/${photo.seriesPath}/${photo.path}/DecimatedModel.json`;
  jsonLoader.load(jsonPath, geometry => {
    model.geometry = geometry;
    loaded();
  });
}
