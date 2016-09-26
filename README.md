# Waivecar - App

Similar to the API, this should be under the `nvmsh` version ... see the readme there to find out more about that.

## Tools used

So there's a number of technologies used that are relatively newish. Many of them have their own CLI and management tools. 
The list with links to the CLI documentation: [cordova](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/), ionic, gulp, bower.

## Tips on 

### Finding things

I (cjm) can't find any evidence of some UI builder that was used to manager the flow - I think it must have been done by hand.  Anyway, the "routes" are in `js/config/app-states.js`.

### Making things run

#### Linux
I (cjm) have had success using a usb cable to an android phone with `ionic run android`. Note that this doesn't rebuild things if you change code

#### OSX
I'm (cjm) not primarily an osx guy so this may be suboptimal but here are my notes nonetheless. 

So it looks like you need the following (assuming you're using a consumer-setup osx):

  * administrative access
  * xcode
  * brew (arguably you could use others but this is what I used)
  * about 4-8 hours

> Note: I *believe* `iterm2` is still what the cool kids use for a terminal emulator and that's what I put on --- but this is by no means a requirement.

Here's generally what I did after installing the above:

  $ brew install git
  $ git clone https://github.com/clevertech/Waivecar
    ... magic credentials ...
    # This next line is taken from https://github.com/creationix/nvm
    # As of Sept 23, 2016, this is the version of node that is known to work.
    # I (cjm) don't have the time to cross my fingers and upgrade. I'm going with
    # what I know works.

  $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash 
    # Follow the instructions and put the lines into ~/.profile and start a new terminal

  $ nvm install v4.2.6

    # check it
  $ node --version
  $ cd Waivecar
  $ git checkout --track -b app/development origin/app/development
  $ npm install
    # Ignore warnings for the same reason as above.

    #
    # 1) It really looks like the package.json of the npm install command doesn't cover this.
    #    There may be a ct reason, these are pretty core things to *accidentally* omit.
    #
    # 2) It looks like that putting ionic at 1.7.16 works. It may work at a later version, 
    #    but 2.0.0 was not my friend when I was doing this.  When I got to the `ionic run ios`
    #    step I got an error about CDVCamera.o which the internet had mixed messages on but 
    #    essentially said that using an older version of ionic reliably remediated it.
    #
  $ npm install ionic@1.7.16 cordova@6.2.0 -g
  $ ionic platform add ios

    # At least *I* didn't have to do the `--unsafe-perm=true` that was recommended here.
  $ sudo npm install ios-sim ios-deploy
  $ ionic build ios
  $ ionic run ios


### Creating new things

If you **add a controller** you have to put it in some giant enumerated list in `js/app.js`. This *could* have grabbed `*.js` but it doesn't and there may even be a dependency problem to doing so given the state of this thing, so just tack your new thing on at the end.

### Debugging

Since this is all a web-app with a few hooks, you can debug it over usb like any other website.  See [here](https://developers.google.com/web/tools/chrome-devtools/debug/remote-debugging/remote-debugging?hl=en).  Essentially you type `chrome://inspect` inside of a modern version of chrome and if the magic is set up right, you can look at the current running app using the chrome inspector.

This can be especially helpful because it's not always easy to know what all these tools end up creating as the final form inside the app.

Also if you long-press the waivecar logo on the initial screen you have an option of using different servers.  I'm not documenting the names
here because they could change without me remembering to change the documentation... Try it and check the code.

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
