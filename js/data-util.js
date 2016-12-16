
function toPath (name) {
  return name.toLowerCase().replace(/ /g, '-');
}

function toName (path) {
  return toTitleCase(path.replace(/-/g, ' '));
}

function photoToHash (photo) {
  return `${photo.seriesPath}__${photo.path}`;
}

function hashToPhoto (hash, seriesData) {
  let [seriesPath, photoPath] = hash.split('__');
  seriesPath = seriesPath.replace('#', '');

  let series = seriesData.find(s => s.path === seriesPath);
  if (!series) return null;

  let photo = series.photos.find(p => p.path === photoPath);
  return photo;
}

// using old export for node ;)
module.exports = {
  toName,
  toPath,
  photoToHash,
  hashToPhoto
};

function toTitleCase (str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
