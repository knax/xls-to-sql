'use strict';

const xlsx = require('xlsx');
const  _= require('lodash');
const fs = require('fs-extra-promise');

const name = process.argv[2];

const config = require('./format/' + name + '.json');

let workbook = xlsx.readFile('source/' + name + '.xlsx');
let worksheet = workbook.Sheets[config.mainSheet];

var headerList = [];

for(let i = config.header.start.column.charCodeAt(0); i <= config.header.end.column.charCodeAt(0); i++) {
  headerList.push(String.fromCharCode(i) + config.header.start.row);
}

headerList = headerList.map(function (value) {
  return worksheet[value].v;
});

var dataList = [];

for(let j = parseInt(config.data.start.row); j <= parseInt(config.data.end.row); j++) {
  let data = [];
  for(let k = config.data.start.column.charCodeAt(0); k <= config.data.end.column.charCodeAt(0); k++) {
    data.push(String.fromCharCode(k) + j);
  }
  dataList.push(data);
}

dataList = dataList.map(function (data) {
  return data.reduce(function (row, cell, key) {
    row[headerList[key]] = worksheet[cell].v;
    return row;
  }, {});
});

dataList = dataList.map(function (data) {
  return _.mapValues(data, function (cell, columnName) {
    if(config.lookup && config.lookup[columnName]) {
      let lookupConfig = config.lookup[columnName];

      let worksheetLookup = workbook.Sheets[lookupConfig.sheets];

      for(let currentRow = parseInt(lookupConfig.start.row); currentRow <= parseInt(lookupConfig.end.row); currentRow++) {
        let cellName = lookupConfig.end.column + currentRow;
        let currentCell = worksheetLookup[cellName];

        if(currentCell.v.toString().toLowerCase() === cell.toString().toLowerCase()) {
          let cellNameInside = String.fromCharCode(lookupConfig.start.column.charCodeAt(0)) + currentRow;
          return worksheetLookup[cellNameInside].v;
        }
      }
    }

    return cell;
  });
});

fs.outputJsonAsync('./json/' + name + '.json', dataList).then(function (result) {
  console.log('Write json success');
});
//
//console.log(dataList);

//console.log(JSON.stringify(workbook, null, 2));