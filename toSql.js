'use strict';

const  _= require('lodash');
const fs = require('fs-extra-promise');

const name = process.argv[2];

const config = require('./format/' + name + '.json');
const sourceJson = require('./json/' + name + '.json');

let result = sourceJson.map(function (value) {
  let row = _.clone(value);

  row = _.reduce(row, function (accumulator, value, key) {
    accumulator[_.snakeCase(key)] = value;
    return accumulator;
  }, {});

  return (_.template(config.query.insert))(row);
});

result = result.map(function (value) {
  return value + ';';
});

fs.writeFileAsync('./sql/' + name + '.sql', result.join('\n')).then(function () {
  console.log('Create sql success');
});