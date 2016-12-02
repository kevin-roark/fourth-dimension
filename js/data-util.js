
function toPath (name) {
  return name.toLowerCase().replace(/ /g, '-');
}

function toName (path) {
  return toTitleCase(path.replace(/-/g, ' '));
}

// using old export for node ;)
module.exports = {
  toName,
  toPath
};

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
