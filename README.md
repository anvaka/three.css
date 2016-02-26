# three.css

A CSS renderer for three.js in CommonJS format

# usage

To create a CSS renderer and then render the scene:

``` js
var THREE = require('three');
var CSS3D = require('three.css');

var cssScene = new THREE.Scene();
var cssRenderer = new CSS3D.Renderer();
cssRenderer.setSize(sceneWidth, sceneHeight);

var container = cssRenderer.domElement;
container.style.position = 'absolute';
container.style.top = 0;
container.style.margin = 0;
container.style.padding = 0;

document.body.appendChild(cssRenderer.domElement);

// render loop
requestAnimationFrame(animate);

function animate() {
  requestAnimationFrame(animate);

  cssRenderer.render(cssScene, camera);
  // ...
}
```

To add objects to the scene:

``` js
  var css3dObject = new CSS3D.Object(domElement);
  cssScene.add(css3dObject);
```

# license

MIT
