/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/ 
 * Adopted to commonjs by anvaka https://github.com/anvaka
 */
module.exports = init;

// We need to use the same identifier to be sure that multiple instances of
// css renderer are using the same resolution logic. Previously this module
// was using instanceOf operator which would result in different values.
// E.g.:
//
// var module1 = require('three.css')(THREE);
// var module2 = require('three.css')(THREE);
//
// var object = new module1.CSS3DObject(element);
// assert(object instanceOf module2.CSS3DObject) // will fail!
//
var CSS3DObjectType = 355 + 1;
var CSS3DSpriteType = 355 + 2;


function init(THREE) {

  CSS3DObject.prototype = Object.create(THREE.Object3D.prototype);
  CSS3DObject.prototype.constructor = CSS3DObject;

  CSS3DSprite.prototype = Object.create(CSS3DObject.prototype);
  CSS3DSprite.prototype.constructor = CSS3DSprite;


  return {
    Object: CSS3DObject,
    Sprite: CSS3DSprite,
    Renderer: CSS3DRenderer
  };

  function CSS3DObject(element) {

    THREE.Object3D.call(this);

    this.element = element;
    this.element.style.position = 'absolute';
    this.type = CSS3DObjectType

    this.addEventListener('removed', function() {
      if (this.element.parentNode !== null) {
        this.element.parentNode.removeChild(this.element);
      }
    });
  }

  function CSS3DSprite(element) {
    CSS3DObject.call(this, element);
    this.type = CSS3DSpriteType;
  }

  //

  function CSS3DRenderer () {

    console.log('css-renderer', THREE.REVISION);

    var _width, _height;
    var _widthHalf, _heightHalf;

    var matrix = new THREE.Matrix4();

    var cache = {
      camera: {
        fov: 0,
        style: ''
      },
      objects: {}
    };

    var domElement = document.createElement('div');
    domElement.style.overflow = 'hidden';

    domElement.style.WebkitTransformStyle = 'preserve-3d';
    domElement.style.MozTransformStyle = 'preserve-3d';
    domElement.style.oTransformStyle = 'preserve-3d';
    domElement.style.transformStyle = 'preserve-3d';

    this.domElement = domElement;

    var cameraElement = document.createElement('div');

    cameraElement.style.WebkitTransformStyle = 'preserve-3d';
    cameraElement.style.MozTransformStyle = 'preserve-3d';
    cameraElement.style.oTransformStyle = 'preserve-3d';
    cameraElement.style.transformStyle = 'preserve-3d';

    domElement.appendChild(cameraElement);

    this.setClearColor = function() {};

    this.getSize = function() {

      return {
        width: _width,
        height: _height
      };

    };

    this.setSize = function(width, height) {

      _width = width;
      _height = height;

      _widthHalf = _width / 2;
      _heightHalf = _height / 2;

      domElement.style.width = width + 'px';
      domElement.style.height = height + 'px';

      cameraElement.style.width = width + 'px';
      cameraElement.style.height = height + 'px';

    };

    var getCameraCSSMatrix = function(matrix) {

      var elements = matrix.elements;

      return 'matrix3d(' +
        epsilon(elements[0]) + ',' +
        epsilon(-elements[1]) + ',' +
        epsilon(elements[2]) + ',' +
        epsilon(elements[3]) + ',' +
        epsilon(elements[4]) + ',' +
        epsilon(-elements[5]) + ',' +
        epsilon(elements[6]) + ',' +
        epsilon(elements[7]) + ',' +
        epsilon(elements[8]) + ',' +
        epsilon(-elements[9]) + ',' +
        epsilon(elements[10]) + ',' +
        epsilon(elements[11]) + ',' +
        epsilon(elements[12]) + ',' +
        epsilon(-elements[13]) + ',' +
        epsilon(elements[14]) + ',' +
        epsilon(elements[15]) +
        ')';

    };

    var getObjectCSSMatrix = function(matrix) {

      var elements = matrix.elements;

      return 'translate3d(-50%,-50%,0) matrix3d(' +
        epsilon(elements[0]) + ',' +
        epsilon(elements[1]) + ',' +
        epsilon(elements[2]) + ',' +
        epsilon(elements[3]) + ',' +
        epsilon(-elements[4]) + ',' +
        epsilon(-elements[5]) + ',' +
        epsilon(-elements[6]) + ',' +
        epsilon(-elements[7]) + ',' +
        epsilon(elements[8]) + ',' +
        epsilon(elements[9]) + ',' +
        epsilon(elements[10]) + ',' +
        epsilon(elements[11]) + ',' +
        epsilon(elements[12]) + ',' +
        epsilon(elements[13]) + ',' +
        epsilon(elements[14]) + ',' +
        epsilon(elements[15]) +
        ')';

    };

    var renderObject = function(object, camera) {
      if (object.type ===  CSS3DObjectType) {

        var style;

        if (object.type === CSS3DSpriteType) {

          // http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

          matrix.copy(camera.matrixWorldInverse);
          matrix.transpose();
          matrix.copyPosition(object.matrixWorld);
          matrix.scale(object.scale);

          matrix.elements[3] = 0;
          matrix.elements[7] = 0;
          matrix.elements[11] = 0;
          matrix.elements[15] = 1;

          style = getObjectCSSMatrix(matrix);

        } else {

          style = getObjectCSSMatrix(object.matrixWorld);

        }

        var element = object.element;
        var cachedStyle = cache.objects[object.id];

        if (cachedStyle === undefined || cachedStyle !== style) {

          element.style.WebkitTransform = style;
          element.style.MozTransform = style;
          element.style.oTransform = style;
          element.style.transform = style;

          cache.objects[object.id] = style;

        }

        if (element.parentNode !== cameraElement) {

          cameraElement.appendChild(element);

        }

      }

      for (var i = 0, l = object.children.length; i < l; i++) {
        renderObject(object.children[i], camera);
      }
    };

    this.render = function(scene, camera) {

      var fov = 0.5 / Math.tan(THREE.Math.degToRad(camera.fov * 0.5)) * _height;

      if (cache.camera.fov !== fov) {

        domElement.style.WebkitPerspective = fov + "px";
        domElement.style.MozPerspective = fov + "px";
        domElement.style.oPerspective = fov + "px";
        domElement.style.perspective = fov + "px";

        cache.camera.fov = fov;

      }

      scene.updateMatrixWorld();

      if (camera.parent === null) camera.updateMatrixWorld();

      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix(camera.matrixWorldInverse) +
        " translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

      if (cache.camera.style !== style) {

        cameraElement.style.WebkitTransform = style;
        cameraElement.style.MozTransform = style;
        cameraElement.style.oTransform = style;
        cameraElement.style.transform = style;

        cache.camera.style = style;
      }
      renderObject(scene, camera);
    };
  }
}

function epsilon (value) {
  // Safari does not support exponential values in matrix3:
  // https://bugs.webkit.org/show_bug.cgi?id=154506
  return Math.abs(value) < 1e-8 ? 0 : value;
}
