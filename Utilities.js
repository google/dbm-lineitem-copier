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

// Constants for DBM API scopes and Rest API URLs.
var DBM_API_SCOPE = 'https://www.googleapis.com/auth/doubleclickbidmanager';
var API_URL_SDF =
    'https://www.googleapis.com/doubleclickbidmanager/v1/sdf/download';

var dbmApiService;
var userProperties = PropertiesService.getUserProperties();
var ui = SpreadsheetApp.getUi();


/*
 * Calls the DBM API function to download SDF files.
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


/*
 * Calls the DBM API via an HTTP call, previously checking if the DBM API
 * service is available and authorized, otherwise prompting the user to
 * open the correct URL to authorize the API access.
 * @param {string} url The URL of the REST API call to make.
 * @param {string} methodType Value for the "method" option (GET/POST/...).
 * @param {Object} requestBody The object containing the request parameters.
 * @return {Object} The API call response.
 * @private
 */
function callApi_(url, methodType, requestBody) {
  dbmApiService = dbmApiService|| getDbmApiService_();
  if (!dbmApiService.hasAccess()) {
    var authorizationUrl = dbmApiService.getAuthorizationUrl();
    var htmlOutput = HtmlService.createHtmlOutput('You need to authorize the ' +
        'tool to access the API using your credentials. <a href="' +
        authorizationUrl + '" target="_blank">Click here to authorize the ' +
        'access to the API</a>, and then launch the command again.');
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Allow access to the ' +
        'DoubleClick API');
    throw new Error('Missing access: open the following URL and re-run the ' +
        'script: ' + authorizationUrl);
  }
  var headers = {
        'Content-Type': 'application/json',
        'Accept' :'application/json',
        'Authorization': 'Bearer ' + dbmApiService.getAccessToken()
  };
  var options = {
        method: methodType,
        headers : headers,
        muteHttpExceptions: true
  };
  if (requestBody) {
    options.payload = JSON.stringify(requestBody);;
  }
  return UrlFetchApp.fetch(url, options);
}


/*
 * Stores the Google Cloud Project credential CLIENT ID and CLIENT SECRET as
 * userProperties.
 * @param {string} clientId The Client ID from GCP Credentials.
 * @param {string} clientSecret The Client Secret from GCP Credentials.
 * @private
 */
function setupApiCredentials_(clientId, clientSecret) {
  userProperties.setProperty('CLIENT_ID', clientId);
  userProperties.setProperty('CLIENT_SECRET', clientSecret);
}


/*
 * Creates the oAuth2-based DBM API service, using the Client ID and Secret
 * provided by the user, and requesting the DBM API Scope.
 * Function dbmAuthCallback_ is provided as callback function.
 * @private
 */
function getDbmApiService_() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('dbmApi')
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setClientId(userProperties.getProperty('CLIENT_ID'))
      .setClientSecret(userProperties.getProperty('CLIENT_SECRET'))
      .setCallbackFunction('dbmAuthCallback_')
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope(DBM_API_SCOPE)
      .setParam('login_hint', Session.getActiveUser().getEmail())
      .setParam('access_type', 'offline')
      .setParam('approval_prompt', 'force');
}


/*
 * The callback function for the DBM API service request.
 * @return {string} The result of the authorization request.
 * @private
 */
function dbmAuthCallback_(request) {
  var service = getDbmApiService_();
  var isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}


/*
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
