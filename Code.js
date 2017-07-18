/***********************************************************************
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Note that these code samples being shared are not official Google
products and are not formally supported.
************************************************************************/

// Google Cloud Project Authorization details
var CLIENT_ID = [REPLACE WITH YOUR CLIENT_ID];
var CLIENT_SECRET = [REPLACE WITH YOUR CLIENT_SECRET];

var doc = SpreadsheetApp.getActiveSpreadsheet();
var configSheet = doc.getSheetByName('Config');
var originLiSheet = doc.getSheetByName('OriginLI');
var destinationLisSheet = doc.getSheetByName('DestinationLIs');
var ROW_SDF_VERSION = 2;
var ROW_SETTING = 3;
var ROW_ORIGIN_LI_ID = 6;
var ROW_ORIGIN_LI_NAME = 7;
var ROW_ORIGIN_LI_VALUE = 8;
var ROW_DESTINATION_LI = 12;
var FILTER_LI = 'LINE_ITEM_ID';
var SDF_ID = 'Line Item Id';
var SDF_NAME = 'Name';
var selectedSetting;
var originLiId;
var originLiObject = {};
var destinationLiObject = {};


function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Functions')
      .addItem('Retrieve ORIGIN Line Item info', 'getOrigin_')
      .addItem('Retrieve DESTINATION Line Items info', 'getDestination_')
      .addItem('Copy Line Item setting', 'copyLiSetting_')
      .addItem('Reset', 'reset_')
      .addToUi();
  userProperties.setProperty('haschanges', 'false');
}

function init_() {
  setupApiCredentials_(CLIENT_ID, CLIENT_SECRET);
  selectedSetting = configSheet.getRange(ROW_SETTING,2).getValue();
}

/*
 * Retrieve ORIGIN Line Item info.
 * Returns the value of the selected Line Item setting
 */
function retrieveOriginLi_() {
  originLiId = configSheet.getRange(ROW_ORIGIN_LI_ID,2).getValue();
  var sdfVersion = configSheet.getRange(ROW_SDF_VERSION,2).getValue();
  var sdfResponse = getSdf_(FILTER_LI, [originLiId], ["LINE_ITEM"], sdfVersion);
  var originLiData = Utilities.parseCsv(sdfResponse['lineItems']);
  originLiSheet.clearContents();
  originLiSheet.getRange(1,1, originLiData.length, originLiData[0].length).setValues(originLiData);
  originLiObject = populateObject_(originLiSheet);
  configSheet.getRange(ROW_ORIGIN_LI_NAME,2).setValue(originLiObject[SDF_NAME][0]);
  configSheet.getRange(ROW_ORIGIN_LI_VALUE,2).setValue(originLiObject[selectedSetting][0]);
  return originLiObject[selectedSetting][0];
}

function retrieveDestinationLis_() {
  var ui = SpreadsheetApp.getUi();
  var hasChanges = userProperties.getProperty('haschanges');
  if (hasChanges == 'true') {
    var response = ui.alert('You are about to download the current DBM settings values for the destination Line Items. ' + 
      'They will overwrite any change you have already made, unless you have already uploaded the resulting SDF file to DBM. ' + 
      'Do you wish to continue?', ui.ButtonSet.YES_NO);
    if (response == ui.Button.NO) {
     return 'abort';
    }
  }
  var liIds = [];
  for (var row=ROW_DESTINATION_LI; row < configSheet.getDataRange().getNumRows() +1; row++) {
    var liId = configSheet.getRange(row, 1).getValue();
    configSheet.getRange(row, 2,1,3).clearContent();
    liIds.push(liId);
    Logger.log(liId);
  }
  var sdfVersion = configSheet.getRange(ROW_SDF_VERSION,2).getValue();
  var sdfResponse = getSdf_(FILTER_LI, liIds, ["LINE_ITEM"], sdfVersion);
  var destinationLiData = Utilities.parseCsv(sdfResponse['lineItems']);
  destinationLisSheet.clearContents();
  destinationLisSheet.getRange(1,1, destinationLiData.length, destinationLiData[0].length).setValues(destinationLiData);
  destinationLiObject = populateObject_(destinationLisSheet);
  for (var row=ROW_DESTINATION_LI; row < configSheet.getDataRange().getNumRows() +1; row++) {
    // Log the current value of the destination LIs setting
    configSheet.getRange(row,1).setValue(destinationLiObject[SDF_ID][row - ROW_DESTINATION_LI]);
    configSheet.getRange(row,2).setValue(destinationLiObject[SDF_NAME][row - ROW_DESTINATION_LI]);
    configSheet.getRange(row,3).setValue(destinationLiObject[selectedSetting][row - ROW_DESTINATION_LI]);
    
  }
}

function updateDestinationLis_(settingValue) {
  var headers = destinationLisSheet.getRange(1,1,1,destinationLisSheet.getDataRange().getNumColumns()+1).getValues()[0];
  var indexOfSetting = headers.indexOf(selectedSetting);
  for (var row=2; row < destinationLisSheet.getDataRange().getNumRows() +1; row++) {
    destinationLisSheet.getRange(row,indexOfSetting + 1).setValue(settingValue);
    // Updates the value of the destination LIs setting
    configSheet.getRange(row + ROW_DESTINATION_LI - 2,4).setValue(settingValue);
  }
}

function clearOriginInfo_() {
  configSheet.getRange(ROW_ORIGIN_LI_NAME,2, ROW_ORIGIN_LI_VALUE - ROW_ORIGIN_LI_NAME + 1, 1).clearContent();
}

function clearDestinationInfo_(clearName, row) {
  var startingColumn = clearName ? 2 : 3;
  var columnsToClear = clearName ? 3 : 2;
  if (row) {
    configSheet.getRange(row,startingColumn, 1, columnsToClear).clearContent();
  } else {
    configSheet.getRange(ROW_DESTINATION_LI,startingColumn, configSheet.getDataRange().getNumRows() - ROW_DESTINATION_LI + 1, columnsToClear).clearContent();
  }
}

function isDestinationInfoLoaded_() {
  var liNames = configSheet.getRange(ROW_DESTINATION_LI,2, configSheet.getDataRange().getNumRows() - ROW_DESTINATION_LI + 1, 1).getValues();
  for (var i=0; i<liNames.length; i++) {
    if (liNames[i][0].length < 1) {
      return false;
    }
  }
  return true;
}

/*
 * Inits the tool and retrieves Origin LI settings.
 */
function getOrigin_() {
  init_();
  retrieveOriginLi_();
}

/*
 * Inits the tool and retrieves Destination LIs settings.
 */
 function getDestination_() {
  init_();
  retrieveDestinationLis_();
}

/*
 * Copy Selected Line Item setting to destination Line Items
 */
function copyLiSetting_() {
  init_();
  // Retrieves Origin Line Item info and setting value.
  var settingValue = retrieveOriginLi_();
  if (!isDestinationInfoLoaded_()) {
    // Downloads current settings of Destination Line Items
    if (retrieveDestinationLis_() == 'abort') {
      return 'abort';
    }
  }
  updateDestinationLis_(settingValue);
  userProperties.setProperty('haschanges', 'true');
}

/*
 * Reset user-inserted values
 */
function reset_() {
  //configSheet.getRange(ROW_SETTING,2).clearContent();
  configSheet.getRange(ROW_ORIGIN_LI_ID,2).clearContent();
  configSheet.getRange(ROW_DESTINATION_LI,1,configSheet.getDataRange().getNumRows() - ROW_DESTINATION_LI + 1,1).clearContent();
  clearOriginInfo_();
  clearDestinationInfo_(true);
  userProperties.setProperty('haschanges', 'false');
}

/*
 * Clear fields when the user manually updates some specific cells.
 */
function onEdit(e){
  var range = e.range;
  Logger.log(e);
  Logger.log(range);
  if (range.getRow() == ROW_SETTING && range.getColumn() == 2) {
    // The selected setting has changed, we clear the corresponding retrieved value for origin/destination LIs
    clearOriginInfo_();
    clearDestinationInfo_(false);
  } else if (range.getRow() == ROW_ORIGIN_LI_ID && range.getColumn() == 2){
    // The origin Line Item ID has been changed, let's clear the corresponding retrieved values
    clearOriginInfo_();
  } else if (range.getRow() >= ROW_DESTINATION_LI && range.getColumn() == 1) {
    // One (or more) destination LI IDs have been changed, let's clear the corresponding retrieved values
    for (var row = range.getRow(); row<= range.getLastRow(); row++) {
      clearDestinationInfo_(true, row);
    }
  }
}
