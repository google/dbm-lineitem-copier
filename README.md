# Line Item settings copier for DBM

A tool to copy specific settings values from an ORIGIN DBM Line Item to a one or
more DESTINATION Line Items, using DBM Structured Data Files.

## OVERVIEW

This AppScript-based tool lets you use a Google Spreadsheet to retrieve the
current settings from am origin DBM Line Item, select one of those values
(e.g. Geotargeting) and copy it to as many destination Line Items you want.

It uses DBM APIs to download the origin/destination Line Items Data in SDF
format and requires users to manually upload the updated settings of the
destination Line items in the DBM UI.

The same result could be achieved manually downloading and editing the SDF
files, but the tool leverages the APIs and Spreadsheet functionalities to
automate the most manual steps and to easily visualize origin and destination
values.

For more information about DBM Structured Data Files, have a look at the
DoubleClick Bid Manager Help Center:
https://support.google.com/bidmanager/answer/6301070?hl=en

In order to use this tool you need to have valid access to the **DoubleClick Bid
Manager APIs** through your Google Account, and you will need to enable that API
in a Google Cloud Project so that you can generate the Credentials used by
the tool (see the corresponding step of Initial Setup section below).

## INITIAL SETUP

*   Create a new [Google Spreadsheet](https://sheets.google.com) and open its
    script editor (from _Tools > Script Editor_)
    - Copy the code from Code.js and Utilities.js in two corresponding files in
    your AppScript project
    - Add the OAuth2 library clicking on _Resources > Libraries_ and entering
    the corresponding project key: "MswhXl8fVhTFUH_Q3UOJbXvxhMjh3Sh48".
    - Take note of the "Script ID" you can find at _File > Project Properties >
    Script ID_
*   Create a new Google Cloud Project (or use an existing one), and enable the
    DoubleClick Bid Manager APIs from the [API Manager page](https://console.cloud.google.com/apis).
*   Generate new Credentials for the tool:
    - Use the oAuth Client ID credential type and the Web Application
    application type.
    - Add the following URLs to the "Authorized redirect URIs", replacing
      [script id] with the actual Script ID you retrieved from your AppScript
      project:
      - https://script.google.com/oauthcallback
      - https://script.google.com/macros/d/[script id]/usercallback
    - Once the new Credentials have been created, take note of the _Client ID_
      and the _Client Secret_
    - Please refer to the [Google Cloud documentation](https://cloud.google.com)
      for any additional information on how to create a Project or enable APIs.
*   Get back to your AppScript code, and open the Code.gs file. Fill the values
    for the **CLIENT_ID** and **CLIENT_SECRET** constants at the beginning of
    the file using the values you obtained from the Cloud Console.
*   Go back to the Spreadsheet, click on the _Custom Functions_ menu (you might
    need to refresh the page if you don't see it), and select _Retrieve ORIGIN
    Line Item Info_: you will be prompted to allow the tool to access the
    Spreadsheet and to use your DBM API credentials to download the SDF files.
    This only needs to be done once (per user).

## USAGE

*   As general rule **ONLY MANUALLY EDIT CYAN-COLORED CELLS**!
*   In the _Config_ sheet, insert the ID of the origin Line Item in the **Line
    Item ID** field.
*   Select the setting you want to copy from the from the dropdown menu for
    **Line Item setting to copy**.
*   Run the **Custom Functions > Retrieve ORIGIN Line Item Info** function to
    load the configuration settings of the origin Line Item via API.
    - You can see the whole configuration in the _OriginLI sheet_ - but don’t
      edit this manually.
    - You will see the origin Line Item Name and its current value for the
      selected setting in the _Config_ sheet, so that you can check you’re
      copying the correct value from the correct Line Item.
*   List the IDs of all the destination Line Items you want to copy the
    selected setting TO under the **Destination Line Item IDs** column in
    the Destination Line Items section.
    - Please note that all Line Items must be in the same DBM advertiser in
      order to the SDF upload to work successfully.
*   **OPTIONAL**: you can retrieve the current value of the selected setting
    for your destination Line Items - just select **Custom Functions >
    Retrieve DESTINATION Line Items info**
    - You will see the current destination Line Items names and settings in
      the columns next to their IDs.
    - You can see the full current configuration of the destination Line
      Items in the _DestinationLIs_ sheet
*   To finally COPY the current value for the selected setting from the
    origin Line Item to the destination Line Items, select **Custom
    Functions > Copy Line Item Setting**
    - You will see the information of the destination Line Items being
      updated in the Config sheet, and in particular each Line Item will have
      a row with the ID you inserted and the Line Item Name, current value
      for the selected setting and updated value (from the origin Line Item)
    - This action will retrieve the destination Line Items information if it
      hasn’t been done before (with the optional step above), and in
      particular if the destination Line Items names are not populated in the
      corresponding column. Please note that this also means that:
      - You can copy multiple settings from the same origin Line Item to the
        same destination Line Items, as long as during the process you don’t
        retrieve their settings again (as that would overwrite the
        configuration with the one currently in DBM), e.g. you only change the
        selected setting and use "Custom Functions > Copy Line Item Setting".
      - Viceversa, if you for any reason retrieve the destination Line Items
        configuration, either directly because you used "Custom Functions >
        Retrieve DESTINATION Line Items info" or indirectly because you changed
        the destination Line Items IDs, you will lose all the settings you have
        copied until that moment, because you would have re-configured them with
        the current values in DBM (the tool will warn you with a pop-up).
*   To apply these changes, you’ll need to download the SDF file of the
    destination Line Items and upload it in DBM. In particular you need to:
    - Switch to the _DestinationLIs_ sheet
    - Select in the main menu **File > Download As.. > Comma-separated values**
      and save the file on your computer
    - Go to the _Insertion Orders_ page of your advertiser in DBM, and click on
      the right-side three-dots button to select UPLOAD in the SDF drop-down
      menu (more info on how to use SDF in DBM [at this link](https://support.google.com/bidmanager/answer/6301070))
    - Upload the SDF/CSV file you previously downloaded
    - If there are no errors, you will see the updated settings you
      selected in the spreadsheet correctly applied to your destination Line
      Items, and you can also check them running **Custom Functions >
      Retrieve DESTINATION Line Items info** again so that you can check the
      updated values in the destination Line Items.

## Additional info

*   There’s a **Custom Functions > Reset** function in case you want to “clean”
    the _Config_ sheet correctly (although most parts of the sheets are
    automatically cleared when you change some of the settings - e.g. if you
    change the ID of the origin Line Item, the name and current settings are
    cleared as they were referencing to the previous Line Item)
*   You could also manually edit the values in the _DestinationLIs_ sheet (after
    having populated it using **Custom Functions > Retrieve DESTINATION Line
    Items info**), and download the resulting SDF file - without using the
    **Custom Functions > Copy Line Item Setting** functionality. This can be
    useful in case you want to make more complex changes, but you obviously need
    to be careful in editing the correct columns.
    - Please note that you could do this simply downloading the same
      configuration structure downloading the corresponding SDF files from DBM;
      this helps you automating the download of many Line Items at once via the
      list of the ID in the _Config_ sheet.
