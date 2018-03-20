# WebAR-Article

## About

**Article is a responsive and information rich website that is progressively enhanced
with Augmented Reality (AR) content exposed through experimental web technologies. Check out Article in action here:**

[https://google-ar.github.io/WebAR-Article/public/](https://google-ar.github.io/WebAR-Article/public/)

**To learn more about Article, check out the blog post here:**

[https://www.blog.google/products/google-vr/augmented-reality-web-everyone/](https://www.blog.google/products/google-vr/augmented-reality-web-everyone/)

**To learn more about the technologies behind WebAR-Article, please visit:**

[https://developers.google.com/ar/develop/web/getting-started](https://developers.google.com/ar/develop/web/getting-started)

## Getting Started

### Prerequisites

WebAR-Article will work everywhere, desktop, tablet and mobile. However, if you want to experience WebAR-Article's AR content make sure you have installed [WebARonARKit](https://github.com/google-ar/WebARonARKit) if you are on iOS or [WebARonARCore](https://github.com/google-ar/WebARonARCore) on Android. If you aren't familar with these experimental browsers, please visit their respective github repository to learn how to get starting.

WebAR-Article is built using modern web development tooling, so before getting started make sure you have [node](https://nodejs.org/en/) and the [npm package manager](https://www.npmjs.com/get-npm) installed on your development machine.

### Installing

Clone this repository and change directories into it and then install its dependencies.

```
git clone git@github.com:google-ar/webar-article.git article && cd article && npm install
```

### Running

To view the site on desktop, start the webpack dev server by the following command:
```
npm run dev
```
Then open your browser and navigate to localhost:8000. To view Article's AR content, open either WebARonARCore on Android or WebARonARKit on iOS and navigate the browser to the IP address of the machine serving the site, followed by the port 8000: i.e. http://XXX.XXX.XXX.XXX:8000

### Building
To build the site for deployment, run the following command:
```
npm run build
```
Once built, all the build files will be in the public folder.

## Contributing

If you have fixes, we would love to have your contributions. Please read CONTRIBUTING.md for more information on the process we would like contributors to follow.

## License

Apache License Version 2.0 (see the LICENSE file inside this repo).

## Disclaimer

**This is not an official Google product.**

## Built with

+ [three.js](https://threejs.org/)
+ [three.ar.js](https://github.com/google-ar/three.ar.js)
+ [Draco](https://github.com/google/draco)
+ [Poly](https://poly.google.com/)
+ [Bootstrap](http://getbootstrap.com/)
+ [Bootswatch](https://bootswatch.com/)

## Credits
+ [Wikipedia](https://en.wikipedia.org/wiki/Space_suit)
+ [Poly Model](https://poly.google.com/view/dLHpzNdygsg)

## Links
+ [WebARonARCore](https://github.com/google-ar/WebARonARCore)
+ [WebARonARKit](https://github.com/google-ar/WebARonARKit)
