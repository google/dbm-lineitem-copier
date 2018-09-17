/***********************************************************************
Copyright 2018 Google Inc.

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

// Constants for DV360 API scopes and Rest API URLs.
var API_URL_SDF =
    'https://www.googleapis.com/doubleclickbidmanager/v1/sdf/download';

var userProperties = PropertiesService.getUserProperties();
var ui = SpreadsheetApp.getUi();


/**
 * Calls the DV360 API function to download SDF files.
 * @param {string} filterType The type of filter to apply.
 * @param {string[]} filterIds Array of IDs to filter on.
 * @param {string} fileTypes The type of SDF file to download.
 * @param {string=} sdfVersion The SDF version to use (defaults to 3).
 * @return {Object} The parsed JSON object of the API response.
 * @private
 */
function getSdf_(filterType, filterIds, fileTypes, sdfVersion) {
  var sdfV = sdfVersion || '3';
  var requestParameters = {
    "filterType": filterType,
    "filterIds": filterIds,
    "fileTypes": fileTypes,
    "version": sdfV
  };
  var response = callApi_(API_URL_SDF, 'POST', requestParameters);
  return JSON.parse(response);
}


/**
 * Calls the DV360 API via an HTTP call, previously checking if the DBM API
 * service is available and authorized, otherwise prompting the user to
 * open the correct URL to authorize the API access.
 * @param {string} url The URL of the REST API call to make.
 * @param {string} methodType Value for the "method" option (GET/POST/...).
 * @param {Object} requestBody The object containing the request parameters.
 * @return {Object} The API call response.
 * @private
 */
function callApi_(url, methodType, requestBody) {
  var headers = {
      'Content-Type': 'application/json',
      'Accept' :'application/json',
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
  };
  var options = {
      method: methodType,
      headers : headers,
      muteHttpExceptions: true
  };
  if (requestBody) {
    options.payload = JSON.stringify(requestBody);
  }
  return UrlFetchApp.fetch(url, options);
}


/**
 * Given a source sheet, returns an object with the column names as key
 * and an array of the column values as value.
 * @params {Spreadsheet}
 * @return {Object} An Object mapped to the input sheet content.
 */
function populateObject_(sheet) {
  var resultObject = {};
  var allRange = sheet.getDataRange();
  var allValues = allRange.getValues();
  for (var col=0; col<allRange.getLastColumn(); col ++) {
    var contentArray = [];
    for (var row=1; row<allRange.getLastRow(); row ++) {
      contentArray.push(allValues[row][col]);
    }
    resultObject[allValues[0][col]] = contentArray;
  }
  return resultObject;
}
