GDE Adapter
===========

AngularJS library to open the GDE web application into an iFrame and send postMessages to communicate between the iFrame container and the iFrame itself. Easy to integrate in an already existing AngularJS solution.

### Dependencies

- [AngularJS](https://angularjs.org/) ~1.5.x
- [jQuery](https://jquery.org) ~1.11.3

... that's all!

<a name="getting-started"></a>
## Getting started

### Requirements
Create a .bowerrc file at the same level of your bower.json file
```javascript
{
  "directory": "bower_components",
  "json": "bower.json",
  "registry": {
  "register": "https://bower.logibec.com",
  "publish": "https://bower.logibec.com",
  "search": [
    "https://bower.logibec.com",
    "https://bower.herokuapp.com",
    "http://vwdevteam11.logibec.com:5678"
  ]
 }
}
```
*This will allow you to connect Logibec's bower server. If the package is not found, it will default back to github*

### Installation
* Install the library in your AngularJS project
```
bower install --save gde-adapter
```

### Configuration
* You must configure the trusted urls using the *GdeConfigServiceProvider*
* targetOrigin: the url where is hosted the GDE application
* currentWindow: the url of the container of the GDE application

```javascript
function configTrustedUrls(GdeConfigServiceProvider) { 
    GdeConfigServiceProvider.setTrustedUrls({
        "targetOrigin": "http://w5apps1601:62040", 
        "currentWindow": "http://localhost:8888"
    });
}
```