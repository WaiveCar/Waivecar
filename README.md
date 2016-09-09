# Waivecar - App

Similar to the API, this should be under the `nvmsh` version ... see the readme there to find out more about that.

## Tools used

So there's a number of technologies used that are relatively newish. Many of them have their own CLI and management tools. 
The list with links to the CLI documentation: [cordova](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/), ionic, gulp, bower.

## Tips on 

### Finding things

I (cjm) can't find any evidence of some UI builder that was used to manager the flow - I think it must have been done by hand.  Anyway, the "routes" are in `js/config/app-states.js`.

### Making things run

I (cjm) have had success using a usb cable to an android phone with `ionic run android`. Note that this doesn't rebuild things if you change code

### Creating new things

If you **add a controller** you have to put it in some giant enumerated list in `js/app.js`. This *could* have grabbed `*.js` but it doesn't and there may even be a dependency problem to doing so given the state of this thing, so just tack your new thing on at the end.

### Debugging

Since this is all a web-app with a few hooks, you can debug it over usb like any other website.  See [here](https://developers.google.com/web/tools/chrome-devtools/debug/remote-debugging/remote-debugging?hl=en).  Essentially you type `chrome://inspect` inside of a modern version of chrome and if the magic is set up right, you can look at the current running app using the chrome inspector.

This can be especially helpful because it's not always easy to know what all these tools end up creating as the final form inside the app.

## Config

In order to point the app to a new place you need to modify `./www/js/config/app-settings.js`


## Clevertech notes

ionic plugin add https://github.com/EddyVerbruggen/LaunchMyApp-PhoneGap-Plugin.git --variable URL_SCHEME=WaiveCar

## Removed from package.json until working on Node 4.0.0

"karma": "^0.12.37",
"karma-chai": "^0.1.0",
"karma-jasmine": "^0.3.5",
"karma-phantomjs-launcher": "^0.2.0",
"phantomjs": "^1.9.17",




1. `ionic state reset`
2. `npm install`
3. `bower install`
4. `gulp`

5. Apply this fix to `platforms/ios/WaiveCar/WaiveCar-Info.plist`:
And add this XML right before the end of the file inside of the last </dict> entry:

```
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

6. `ionic build ios`
