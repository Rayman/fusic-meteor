Package.describe({
  summary: "Provides bootstrap 3."
});

Package.on_use(function (api) {
  api.use('jquery');

  var path = Npm.require('path');
  var asset_path = path.join('bootstrap-3');
  api.add_files(path.join(asset_path, 'css', 'bootstrap.css'), 'client');
  api.add_files(path.join(asset_path, 'js', 'bootstrap.js'), 'client');

  // fonts
  api.add_files(path.join(asset_path, 'fonts', 'glyphicons-halflings-regular.eot'), 'client');
  api.add_files(path.join(asset_path, 'fonts', 'glyphicons-halflings-regular.ttf'), 'client');
  api.add_files(path.join(asset_path, 'fonts', 'glyphicons-halflings-regular.svg'), 'client');
  api.add_files(path.join(asset_path, 'fonts', 'glyphicons-halflings-regular.woff'), 'client');

  // XXX this makes the paths to the icon sets absolute. it needs
  // to be included _after_ the standard bootstrap css so
  // that its styles take precedence.
  api.add_files(path.join('bootstrap-override.css'), 'client');
});
