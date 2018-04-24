# Waivecar - App

Similar to the API, this should be under the `nvmsh` version ... see the readme there to find out more about that.

## Tools used

So there's a number of technologies used that are relatively newish. Many of them have their own CLI and management tools. 
The list with links to the CLI documentation: [cordova](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/), ionic, gulp, bower.

## Tips on 

### Finding things

I (cjm) can't find any evidence of some UI builder that was used to manager the flow - I think it must have been done by hand.  Anyway, the "routes" are in `js/config/app-states.js`.

### Making things run

#### Android

Here's the install notes:

  $ npm install ionic@1.7 cordova@6 gulp -g
  $ cordova platform add android

Apparently you need two things, in one window you need to run

  $ ionic serve -b

In order to have things recompile and then in another you need to run

  $ ionic run android

to deploy it to the phone

#### iOS
I'm (cjm) not primarily an osx guy so this may be suboptimal but here are my notes nonetheless. 

So it looks like you need the following (assuming you're using a consumer-setup osx):

  * administrative access
  * xcode
  * brew (arguably you could use others but this is what I used)
  * about 4-8 hours

> Note: I *believe* `iterm2` is still what the cool kids use for a terminal emulator and that's what I put on --- but this is by no means a requirement.

Here's generally what I did after installing the above:

  $ brew install git node
  $ git clone https://github.com/waivecar/Waivecar
    ... magic credentials ...
    # This next line is taken from https://github.com/creationix/nvm
    # As of Oct 6, 2017, this is the version of node that is known to work.
    # I (cjm) don't have the time to cross my fingers and upgrade. I'm going with
    # what I know works.

  $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash 
    # Follow the instructions and put the lines into ~/.profile and start a new terminal

  $ nvm install v6.11.4

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
  $ npm install ionic@1.7 cordova@6 gulp -g
  $ ionic platform add ios@4.3.1

    # At least *I* didn't have to do the `--unsafe-perm=true` that was recommended here.
  $ sudo npm install ios-sim ios-deploy -g

    # intercom needs cocoapods ... I don't know ... I just don't know sometimes.
  $ sudo gem install cocoapods 
  $ pod setup
  $ ionic build ios // this *may* not be needed. It appears that "run ios" will do a build.
  $ ionic run ios

You may need to also do this in another terminal:

  $ ionic serve -b

I wish I could be more clear on what magic incantation is required but honestly it may be based on some kind of ctime/mtime check that is subject to race conditions - so be careful and do md5s if you aren't sure. I know, this stuff sucks. Don't ever ask the cool hip kids to write stable software...

About the iOS store options:

  * Does not use IDFA
  * Does use encryption
  * Does qualify for the exceptions

##### Building a release for IOS

  1. Close out XCode.
  1. Increase the version numbers in `config.xml` of `ios-CFBundleVersion` and `version`.
  1. Run `ionic build ios --release` (see http://ionicframework.com/docs/guide/publishing.html)
  1. Patch the Info.plist (see below)
  1. Open up XCode again.
  1. Make sure you have "Generic iOS Device" selected in the top left, after the Square "Stop" button .
  1. From the menubar on top, select "Product" then "Archive".

If you get a license accept issue then you can do `sudo xcodebuild -license accept`.

Lastly, you can't trust xcode with updating this thing out of band.  So if you change it then you likely have to close the project and re-open it.

### Patching the Info.plist
There may be some necessary additions (such as adding NSPhotoLibraryUsageDescription) to `platforms/ios/WaiveCar/WaiveCar-Info.plist`. A clever observer would notice that this file is generated by the build process and does not exist in some generic form.  This means that after the stuff above is done, this probably needs to be manually added.

There's a patchfile in `misc/info-plist.patch` that will give you an idea of what needs to be done here.  If you're super lucky:

  $ patch -p0 < misc/info-plist.patch 

will "just work". If you're not, then look at the patch file and do things manually. You don't have to do this often, hopefully.

### Creating new things

If you **add a controller** you have to put it in some giant enumerated list in `js/app.js`. This *could* have grabbed `*.js` but it doesn't and there may even be a dependency problem to doing so given the state of this thing, so just tack your new thing on at the end.

### Accessing the server

Instead of directly talking to the server, this app uses a very convoluted and indirect way of doing it through an angular thing called [ngResource](https://docs.angularjs.org/api/ngResource).  At first blush it looks close to being an ORM-style way of doing things - however, there's lots of added complexity which make it absurd and comically horrendous. Generally speaking doing `ack-grep '\$resource'` will expose this.  

There's a number of filtering system that are used which are tucked and hidden away in obscure files that prevent a direct mapping from working as most would assume would be the case.

Also, as a security note, these filterings are being done inexplicably client side so if a hacker was able to override it, they'd probably be able to do such things as re-assign their stripe id or other terrible things.  Comically horrendous.

Of course the *right* way to do this would be to unscaffold this indirect action-at-a-distance anti-patterned nonsense and do things directly ... but alas, infinite time isn't at hand.


#### About objects

Also if you think you can do something like

    $scope.user = $auth.me;
    $scope.user.save();

Which looks and sounds *totally legitimate*, dream on! Instead you need to create a promise, go out to the server, grab the thing back as a resource, then you have it.  I kid you the fuck not.  Angular, making life easier since Absolutely never. So here is the right "pattern" to be able to save:

    $data.resources.users.me().$promise
      .then(function(me) {
        $scope.user = me;
      });

"But isn't that enormously ineffecient? Aren't you unnecessarily hitting the server and delaying the page load in order to conform to some bullshit ORM system?  Oh I see, you're avoiding a race condit... no you aren't even doing that - you're simply narrowing the time window without solving the problem... a non-solution to a non-problem!" 

Yes! Now you get it! Welcome to modern programming. Have fun.


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

image conversion hint
 find . -name \*.png | xargs identify | awk '{ print "convert ~/waive/logo-brn.png -resize "$3" "$1 } '   | sh

