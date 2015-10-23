# Waivecar - App

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
