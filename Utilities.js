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

var DBM_API_SCOPE = 'https://www.googleapis.com/auth/doubleclickbidmanager';
var API_URL_SDF = 'https://www.googleapis.com/doubleclickbidmanager/v1/sdf/download';
var API_URL_QUERIES ='https://www.googleapis.com/doubleclickbidmanager/v1/queries';
var API_URL_QUERY = 'https://www.googleapis.com/doubleclickbidmanager/v1/query';
var API_URL_LIDL = 'https://www.googleapis.com/doubleclickbidmanager/v1/lineitems/downloadlineitems';
var API_URL_LIUL = 'https://www.googleapis.com/doubleclickbidmanager/v1/lineitems/uploadlineitems';
var dbmApiService;
var userProperties = PropertiesService.getUserProperties();
var ui = SpreadsheetApp.getUi();

/* ------------------------------------------------------------------------------------------------
 * MAIN API CALLS
 * ------------------------------------------------------------------------------------------------ */
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

function listQueries_() {
  var response = callApi_(API_URL_QUERIES, 'GET', null);
  return JSON.parse(response);
}

function createQuery_(requestParameters) {
  Logger.log('Creating query with params:');
  Logger.log(requestParameters);
  var response = callApi_(API_URL_QUERY, 'POST', requestParameters);
  return JSON.parse(response);
}

function runQuery_(queryId, dataRange) {
  var requestParameters = {
    "dataRange": dataRange
  };
  var response = callApi_(API_URL_QUERY + '/' + queryId, 'POST', requestParameters);
  return response;
}

function getQuery_(queryId) {
  var response = callApi_(API_URL_QUERY + '/' + queryId, 'GET', null);
  return JSON.parse(response);
}

function downloadReport_(reportUrl) {
  var response = UrlFetchApp.fetch(reportUrl);
  return response;
}

function lineitemDownload_(filterType, filterIds) {
  var requestParameters = {
    "filterType": filterType,
    "filterIds": filterIds,
    "format": "CSV",
    "fileSpec": "EWF"
  };
  var response = callApi_(API_URL_LIDL, 'POST', requestParameters);
  return JSON.parse(response);
}


/* ------------------------------------------------------------------------------------------------
 * API HTTP CALL
 * ------------------------------------------------------------------------------------------------ */
function callApi_(url, methodType, requestBody) {
  dbmApiService = dbmApiService|| getDbmApiService_();
  if (!dbmApiService.hasAccess()) {
    var authorizationUrl = dbmApiService.getAuthorizationUrl();
    Logger.log('Open the following URL and re-run the script: ' + authorizationUrl);
    var htmlOutput = HtmlService.createHtmlOutput('You need to authorize the tool to access the API using your credentials. <a href="' + authorizationUrl +
        '" target="_blank">Click here to authorize the access to the API</a>, and then launch the command again.');
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Allow access to the DoubleClick API');
    throw new Error('Missing access: open the following URL and re-run the script: ' + authorizationUrl);
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

/* ------------------------------------------------------------------------------------------------
 * API OAUTH2 HANDLING
 * ------------------------------------------------------------------------------------------------ */

function setupApiCredentials_(clientId, clientSecret) {
  userProperties.setProperty('CLIENT_ID', clientId);
  userProperties.setProperty('CLIENT_SECRET', clientSecret);
}

/*
 * Returns the DBM API Service
 */
function getDbmApiService_() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('dbmApi')
      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(userProperties.getProperty('CLIENT_ID'))
      .setClientSecret(userProperties.getProperty('CLIENT_SECRET'))
      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('dbmAuthCallback_')
      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())
      // Set the scopes to request (space-separated for Google services).
      .setScope(DBM_API_SCOPE)
      // Below are Google-specific OAuth2 parameters.
      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())
      // Requests offline access.
      .setParam('access_type', 'offline')
      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      .setParam('approval_prompt', 'force');
}

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
 * and an array of the column values as value
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
