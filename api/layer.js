const fs = require('fs-extra')
  , path = require('path')
  , log = require('winston')
  , environment = require('../environment/env')
  , LayerModel = require('../models/layer')
  , CounterModel = require('../models/counter');

class Layer {
  constructor(id) {
    this._id = id;
  }

  count() {
    return LayerModel.count();
  }

  getLayers(filter) {
    return LayerModel.getLayers(filter || {});
  }

  getLayer(id) {
    return LayerModel.getById(id);
  }

  async create(layer) {
    var id = await CounterModel.getNext('layer');
    log.info('Got id for layer ' + id);

    switch (layer.type) {
    case 'Feature':
      return await createFeatureLayer(id, layer);
    case 'GeoPackage':
      return await createGeoPackageLayer(id, layer);
    default:
      return await LayerModel.create(id, layer);
    }
  }

  remove(layer) {
    switch (layer.type) {
    case 'Feature':
      return removeFeatureLayer(layer);
    case 'GeoPackage':
      return removeGeoPackageLayer(layer);
    default:
      return LayerModel.remove(layer);
    }
  }

  update(layer) {
    return LayerModel.update(this._id, layer);
  }
}

async function createFeatureLayer(id, layer) {
  log.info('Creating feature collection for id: ' + id);
  layer.collectionName = `features${id}`;
  await LayerModel.createFeatureCollection('features' + id);
  return await LayerModel.create(id, layer);
}

function removeFeatureLayer(layer) {
  LayerModel.dropFeatureCollection(layer)
    .catch(err => log.warn("Error dropping layer collection ", err));

  return LayerModel.remove(layer);
}

async function createGeoPackageLayer(id, layer) {
  layer.file = {
    name: layer.geopackage.originalname,
    contentType: layer.geopackage.mimetype,
    size: layer.geopackage.size,
    relativePath: path.join(id.toString(), layer.geopackage.filename)
  };

  const targetPath = path.join(environment.layerBaseDirectory, layer.file.relativePath);
  console.log('copy geopackage from ' + layer.geopackage.path + ' to ' + targetPath);
  await fs.copy(layer.geopackage.path, targetPath, {clobber: true});
  return await LayerModel.create(id, layer);
}

function removeGeoPackageLayer(layer) {
  const directory = path.dirname(path.join(environment.layerBaseDirectory, layer.file.relativePath));
  fs.remove(directory).catch(err => log.warn("Error removing GeoPackage directory ", err));

  return LayerModel.remove(layer);
}

module.exports = Layer;
