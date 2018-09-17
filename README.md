# Line Item settings copier for DV360

A tool to copy specific settings values from an ORIGIN DV360 (formerly DBM) Line
Item to a one or more DESTINATION Line Items, using DV360 Structured Data Files.

## OVERVIEW

This AppScript-based tool lets you use a Google Spreadsheet to retrieve the
current settings from am origin DV360 Line Item, select one of those values
(e.g. Geotargeting) and copy it to as many destination Line Items you want.

It uses DV360 APIs to download the origin/destination Line Items Data in SDF
format and requires users to manually upload the updated settings of the
destination Line items in the DV360 UI.

The same result could be achieved manually downloading and editing the SDF
files, but the tool leverages the APIs and Spreadsheet functionalities to
automate the most manual steps and to easily visualize origin and destination
values.

For more information about DV360 Structured Data Files, have a look at the
Display&Video 360 Help Center:
https://support.google.com/displayvideo/answer/6301070?hl=en

In order to use this tool you need to have valid access to the **DoubleClick Bid
Manager APIs** through your Google Account, and you will need to enable that API
in a Google Cloud Project so that you can generate the Credentials used by
the tool (see the corresponding step of Initial Setup section below).

## INITIAL SETUP

*   Create a new [Google Spreadsheet](https://sheets.google.com) and open its
    script editor (from _Tools > Script Editor_)
    - Copy the code from Code.js and Utilities.js in two corresponding Code.gs,
    Utilities.gs files in your AppScript project
    - Click on _View > Show manifest file_ to access file appsscript.json, and
    copy the content of file appsscript.json from this project (or even just the
    _oauthScopes_ object) into that file.
    - Click on _Resources > Cloud Platform Project_.  In the following pop-up
    window, click on the blue link to access the Cloud Platform project which
    has automatically been created for the tool.
    - From the Cloud Platform console, open the left-side menu and select "API &
    Services > Library". Search for "DoubleClick Bid Manager API", select it,
    and click on "Enable". You can now close this tab and the Script Editor tab,
    and go back to the Spreadsheet.
*   Click on the _Custom Functions_ menu (you might need to refresh the page if
    you don't see it), and select _Retrieve ORIGIN Line Item Info_: you will be
    prompted to allow the tool to access the Spreadsheet and to use your DV360
    API credentials to download the SDF files. This only needs to be done once
    (per user).

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
    - Please note that all Line Items must be in the same DV360 advertiser in
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
        configuration with the one currently in DV360), e.g. you only change the
        selected setting and use "Custom Functions > Copy Line Item Setting".
      - Viceversa, if you for any reason retrieve the destination Line Items
        configuration, either directly because you used "Custom Functions >
        Retrieve DESTINATION Line Items info" or indirectly because you changed
        the destination Line Items IDs, you will lose all the settings you have
        copied until that moment, because you would have re-configured them with
        the current values in DV360 (the tool will warn you with a pop-up).
*   To apply these changes, you’ll need to download the SDF file of the
    destination Line Items and upload it in DV360. In particular you need to:
    - Switch to the _DestinationLIs_ sheet
    - Select in the main menu **File > Download As.. > Comma-separated values**
      and save the file on your computer
    - Go to the _Insertion Orders_ page of your advertiser in DV360, and click
      on the right-side three-dots button to select UPLOAD in the SDF drop-down
      menu (more info on how to use SDF in DV360 [at this link](https://support.google.com/displayvideo/answer/6301070))
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
      configuration structure downloading the corresponding SDF files from
      DV360; this helps you automating the download of many Line Items at once
      via the list of the ID in the _Config_ sheet.
