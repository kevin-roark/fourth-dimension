
let THREE = require('three');
import OBJLoader from './lib/OBJLoader';

let objLoader = new OBJLoader();
let textureLoader = new THREE.TextureLoader();

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

  let objPath = `models/${photo.seriesPath}/${photo.path}/Model.obj`;
  objLoader.load(objPath, group => {
    model.geometry = group.children[0].geometry;
    loaded();
  },
  _ => _, err => {
    console.err(err);
  });
}
