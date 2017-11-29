/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import TWEEN from '@tweenjs/tween.js';
import isMobile from 'is-mobile-with-ipad';

import DRACOLoader from '../../third_party/draco/DRACOLoader';

import OrbitControls from '../../third_party/three.js/OrbitControls';

import AppBase from './AppBase';

import HUD from '../hud/HUD';

import GroundGrid from '../gfx/GroundGrid';
import Background from '../gfx/Background';
import Reticle from '../gfx/Reticle';
import Shadow from '../gfx/Shadow';

import ARControls from '../ar/ARControls';
import AREffects from '../ar/AREffects';

let RENDERORDER = {
  BACKGROUND: 1,
  GROUNDGRID: 2,
  MODELSHADOW: 3,
  spriteShadow: 4,
  MODEL: 5,
  HUD: 6,
};

export default class App extends AppBase {
  constructor(props) {
    super(props);
  }

  setup = props => {
    this.setupProperties(props);
    this.setupCanvas(props);

    this.setupS3DCamera();
    this.setupS3DScene();
    this.setupS3DControls();

    this.loadMaterial();
    this.setupGroundGrid();
    this.setupBackground();
    this.setupHUD();
    this.setupEvents();
  };

  parseURL = () => {
    let params = this.getUrlParams();
    if (params.armode == true) {
      this.enterFS();
      this.enterAR();
    } else if (params.fsmode == true) {
      this.enterFS();
    }
  };

  getUrlParams = () => {
    let queryString = {};
    let query = decodeURIComponent(
      decodeURIComponent(window.location.search.substring(1))
    );
    query = query.split('+').join(' ');
    let vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split('=');
      if (typeof queryString[pair[0]] === 'undefined') {
        queryString[pair[0]] = decodeURIComponent(pair[1]);
      } else if (typeof queryString[pair[0]] === 'string') {
        let arr = [queryString[pair[0]], decodeURIComponent(pair[1])];
        queryString[pair[0]] = arr;
      } else {
        queryString[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    return queryString;
  };

  setupProperties = props => {
    this.debug = false;
    this.ARMode = false;
    this.FSMode = false;
    this.placedModel = false;
    this.duration = 400;
    this.mouse = new THREE.Vector2();
    this.mouseDown = false;

    if (this.vrDisplay && this.arView.marcher) {
      this.arView.marcher.visible = false;
      this.arView.controls.enabled = false;
    }
  };

  setupHUD = () => {
    this.HUD = new HUD({
      canvas: this.canvas,
      renderer: this.renderer,
      vrDisplay: this.vrDisplay,
      duration: this.duration,
      debug: this.debug,
    });

    this.HUD.renderOrder = RENDERORDER.HUD;
    this.container = document.getElementById('app');

    this.HUD.addEventListener('fullscreen', this.enterFS);
    this.HUD.addEventListener('ar', this.enterAR);
    this.HUD.addEventListener('close', this.close);
    this.HUD.addEventListener('debug', this.toggleDebug);

    this.addEventListener('enterAR', this.HUD.enterAR);
    this.addEventListener('exitAR', this.HUD.exitAR);
    this.addEventListener('enterFS', this.HUD.enterFS);
    this.addEventListener('exitFS', this.HUD.exitFS);

    this.addEventListener('down', this.HUD.down);
    this.addEventListener('up', this.HUD.up);

    this.addEventListener('modelPlaced', this.HUD.modelPlaced);
    this.addEventListener('modelDragged', this.HUD.modelDragged);
    this.addEventListener('modelRotated', this.HUD.modelRotated);

    this.addEventListener('proximityWarning', this.HUD.proximityWarning);
    this.addEventListener('proximityNormal', this.HUD.proximityNormal);

    this.HUD.resize();
  };

  setupS3DCamera = () => {
    let size = this.renderer.getDrawingBufferSize();
    this.S3DCamera = new THREE.PerspectiveCamera(
      45,
      size.width / size.height,
      0.1,
      1000
    );
    this.S3DCameraLastPosition = new THREE.Vector3();
  };

  updateS3DCamera = () => {
    let size = this.renderer.getDrawingBufferSize();
    this.S3DCamera.aspect = size.width / size.height;
    this.S3DCamera.updateProjectionMatrix();
  };

  setupS3DScene = () => {
    this.S3DScene = new THREE.Scene();
    this.S3DScene.rotateY(Math.PI / 4.0);
  };

  setupS3DControls = () => {
    this.S3DControls = new OrbitControls(this.S3DCamera, this.canvas);
    this.S3DControls.enableDamping = true;
    let speed = 0.5 / this.renderer.getPixelRatio();
    this.S3DControls.zoomSpeed = speed;
    this.S3DControls.rotateSpeed = speed;
    this.S3DControls.minPolarAngle = Math.PI / 5.0; // radians
    this.S3DControls.maxPolarAngle = 1.75 * (Math.PI / 3.0); // radians
    this.S3DControls.minAzimuthAngle = -Math.PI; // radians
    this.S3DControls.maxAzimuthAngle = Math.PI; // radians
    this.S3DControls.minDistance = 1.0;
    this.S3DControls.maxDistance = 4;
    this.S3DControls.enablePan = false;
    this.resetS3DCamera();
  };

  resetS3DCamera = () => {
    this.S3DCamera.position.set(0, 2.304552414782168, 2.382298471034347);
    this.S3DControls.target.set(0.0, 1.0, 0.0);
    this.S3DCamera.updateMatrixWorld(true);
  };

  setupCanvas = props => {
    this.canvas = props.canvas;
    let rect = this.canvas.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);
    this.canvasProps = {
      parent: this.canvas.parentElement,
      width: this.canvas.width,
      height: this.canvas.height,
      aspect: this.canvas.width / this.canvas.height,
    };
  };

  enterFS = () => {
    this.dispatchEvent({ type: 'enterFS', object: this });
    this.HUD.setSpacing(this.HUD.getSpacing() * 2.0);
    this.FSMode = true;

    // Save the current scroll position so we can return to it later
    this.scrollX = window.scrollX;
    this.scrollY = window.scrollY;

    // Then scroll the page the top of thw window.
    window.scroll(0, 0);

    // Remove the page content.
    // We have to do this or it will be cover the camera feed in AR mode on
    // WebARonARKit.On WebARonARCore, it would be sufficient to cover the
    // content using a higher z-index on this.canvas.
    document.body.removeChild(this.container);

    // Remove this.canvas from it's original place in the DOM
    // and make it the first child of the body.
    this.canvasProps.parent.removeChild(this.canvas);
    document.body.appendChild(this.canvas);

    // Add fullscreen classes
    document.body.classList.add('fullscreen');
    this.canvas.classList.add('fullscreen');

    this.onWindowResize();
  };

  exitFS = () => {
    this.dispatchEvent({ type: 'exitFS', object: this });
    this.HUD.setSpacing(this.HUD.getSpacing() * 0.5);
    this.FSMode = false;

    // Re-insert the page content
    document.body.appendChild(this.container);

    // Move this.canvas back to it's original place in the DOM
    document.body.removeChild(this.canvas);
    this.canvasProps.parent.appendChild(this.canvas);

    // Remove the fullscreen classes
    document.body.classList.remove('fullscreen');
    this.canvas.classList.remove('fullscreen');

    // Scroll the window back to where it was when the user clicked fullscreen
    window.scroll(this.scrollX, this.scrollY);

    this.resetS3DCamera();
    this.onWindowResize();
  };

  close = event => {
    if (this.ARMode) {
      this.exitAR();
    } else if (this.FSMode) {
      this.exitFS();
    }
  };

  enterAR = () => {
    if (this.FSMode !== true) {
      this.enterFS();
    }
    this.dispatchEvent({ type: 'enterAR', object: this });
    this.tweenOutModel();
    this.modelShadow.material.opacity = 0.5;
    this.spriteShadow.fadeIn(this.duration);

    this.modelScene.position.set(10000, 10000, 10000);
    this.groundGrid.fadeOut(0);

    if (this.vrDisplay && this.arView.marcher) {
      this.arView.controls.enabled = true;
      this.arView.marcher.visible = true;
    }

    this.background.fadeOut(this.duration, 0, () => {
      this.S3DScene.remove(this.modelScene);
      this.ARMode = true;
      this.scene.add(this.reticle);
      this.reticle.fadeIn(this.duration, this.duration);
      if (!this.reticle.getTrackingState()) {
        this.HUD.findingSurface();
      } else {
        this.HUD.foundSurface();
      }
      this.scene.add(this.modelScene);
    });
    this.S3DControls.enabled = false;
  };

  exitAR = () => {
    this.dispatchEvent({ type: 'exitAR', object: this });
    this.modelShadow.material.opacity = 0.25;
    this.spriteShadow.fadeOut(this.duration);
    this.tweenOutModel();
    this.placedModel = false;
    this.ARMode = false;
    this.S3DControls.enabled = true;

    this.reticle.fadeOut(this.duration, 0.0);
    this.background.fadeIn(this.duration, this.duration, () => {
      if (this.arView.marcher) {
        this.arView.controls.enabled = false;
        this.arView.marcher.visible = false;
      }

      this.arControls.disable();
      this.modelScene.position.set(0, 0, 0);
      this.modelScene.rotation.set(0, 0, 0);
      this.modelScene.updateMatrixWorld(true);
      this.model.position.set(0, 0, 0);
      this.model.rotation.set(0, 0, 0);
      this.model.updateMatrixWorld(true);
      this.scene.remove(this.modelScene);
      this.S3DScene.add(this.modelScene);

      if (this.FSMode) {
        this.exitFS();
      }

      this.groundGrid.fadeIn(this.duration, this.duration, () => {
        this.tweenInModel();
      });
    });
  };

  toggleDebug = () => {
    this.debug = !this.debug;
    if (this.debug) {
      this.enterDebug();
    } else {
      this.exitDebug();
    }
  };

  enterDebug = () => {};

  exitDebug = () => {};

  loadMaterial = () => {
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('../public/models/Astronaut/');
    mtlLoader.load('Astronaut.mtl', materials => {
      materials.preload();
      this.loadModel(materials.materials.Astronaut_mat);
    });
  };

  loadModel = material => {
    let dracoLoader = new DRACOLoader('../third_party/draco/', {
      type: 'js',
    });

    dracoLoader.load('../public/models/Astronaut/Astronaut.drc', geometry => {
      geometry.computeVertexNormals();

      this.setupModel(new THREE.Mesh(geometry, material));
      this.setupModelShadow();
      this.setupLights();
      this.setupARControls();
      this.setupAREffects();
      this.setupReticle();
      this.setupModelTween();
      this.parseURL();
      this.HUD.hideLoadingIndicator();
    });
  };

  setupModel = mesh => {
    this.model = new THREE.Object3D();
    this.modelScene = new THREE.Object3D();

    this.modelBoundingBox = new THREE.Box3();
    this.modelBoundingBox.setFromObject(mesh);
    let objectSize = this.modelBoundingBox.getSize();

    let desiredHeight = 1.93;
    let scale = desiredHeight / objectSize.y;
    this.model.renderOrder = RENDERORDER.MODEL;
    this.model.add(mesh);

    let mtx = new THREE.Matrix4().makeScale(scale, scale, scale);
    mesh.castShadow = true;
    mesh.geometry.applyMatrix(mtx);
    this.modelBoundingBox.setFromObject(mesh);

    this.modelScene.add(this.model);
    this.S3DScene.add(this.modelScene);
  };

  setupModelTween = () => {
    this.modelScale = { value: 0.0 };
    this.modelTween = new TWEEN.Tween(this.modelScale);

    this.modelTween.easing(TWEEN.Easing.Cubic.InOut);
    this.modelTween.onUpdate(tween => {
      let scale = this.modelScale.value;
      this.model.scale.set(scale, scale, scale);
      this.spriteShadow.scale.set(scale, scale, scale);
    });
    this.modelTween.to(
      { value: 1.0 },
      this.duration * 2.0,
      this.duration * 10.0
    );
    this.modelTween.start();
  };

  tweenOutModel = () => {
    this.modelTween.to({ value: 0.0 }, this.duration, 0).start();
  };

  tweenInModel = () => {
    this.modelTween.to({ value: 1.0 }, this.duration, 0).start();
  };

  setupModelShadow = () => {
    this.modelShadow = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(5, 5, 2, 2),
      new THREE.ShadowMaterial({
        color: 0x000000,
        opacity: 0.4,
        transparent: true,
      })
    );
    this.modelShadow.geometry.applyMatrix(
      new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90))
    );
    this.modelShadow.renderOrder = RENDERORDER.MODELSHADOW;
    this.modelShadow.receiveShadow = true;
    this.modelScene.add(this.modelShadow);

    this.spriteShadow = new Shadow({
      size: 1.0,
      shadowColor: new THREE.Color(0x000000),
      shadowAlpha: 0.5,
    });
    this.spriteShadow.renderOrder = RENDERORDER.spriteShadow;
    this.spriteShadow.fadeOut(0);
    // this.modelScene.add(this.spriteShadow);
  };

  setupLights = () => {
    let point = new THREE.PointLight(0xffffff, 1, 100);
    point.intensity = 1.5;
    point.position.set(0, 40, -40);
    this.modelScene.add(point);

    let spotLight0 = new THREE.SpotLight(0xffffff);
    spotLight0.intensity = 1.5;
    spotLight0.position.set(-15, 35, 15);
    spotLight0.lookAt(0, 0.5, 0.0);
    spotLight0.castShadow = true;
    let shadowSize = 1024;
    if (!isMobile()) {
      shadowSize *= 4;
    }
    spotLight0.shadow.mapSize.width = shadowSize;
    spotLight0.shadow.mapSize.height = shadowSize;
    spotLight0.shadow.camera.near = this.S3DCamera.near;
    spotLight0.shadow.camera.far = this.S3DCamera.far;
    spotLight0.shadow.camera.fov = this.S3DCamera.fov;
    this.modelScene.add(spotLight0);

    let spotLight1 = new THREE.SpotLight(0xffffff);
    spotLight1.intensity = 1.5;
    spotLight1.position.set(10, 25, 15);
    spotLight1.lookAt(0, 0.5, 0.0);
    this.modelScene.add(spotLight1);

    let spotLight2 = new THREE.SpotLight(0xffffff);
    spotLight2.intensity = 0.25;
    spotLight2.position.set(0, 0, 15);
    spotLight2.lookAt(0, 0.0, 0.0);
    this.modelScene.add(spotLight2);
  };

  setupGroundGrid = () => {
    this.groundGrid = new GroundGrid({
      gridColor: new THREE.Color(0x000000),
      gridAlpha: 0.25,
    });
    this.groundGrid.renderOrder = RENDERORDER.GROUNDGRID;
    this.groundGrid.fadeOut(0);
    this.groundGrid.fadeIn(this.duration, this.duration);
    this.S3DScene.add(this.groundGrid);
  };

  setupBackground = () => {
    this.background = new Background({
      skyColor: new THREE.Color(0x666666),
      groundColor: new THREE.Color(0xf5f5f5),
      alpha: 1.0,
    });
    this.background.renderOrder = RENDERORDER.BACKGROUND;
    this.background.fadeOut(0);
    this.background.fadeIn(this.duration, this.duration);
    this.S3DScene.add(this.background);
  };

  setupEvents = () => {
    window.addEventListener('resize', this.onWindowResize, false);
    this.canvas.addEventListener('mousedown', this.onMouseDown, false);
    this.canvas.addEventListener('mouseup', this.onMouseUp, false);
  };

  updateMouse = event => {
    this.mouse.set(
      event.clientX / window.innerWidth,
      event.clientY / window.innerHeight
    );
  };

  onMouseDown = event => {
    this.updateMouse(event);
    this.mouseDown = true;
  };

  onMouseUp = event => {
    this.mouseDown = false;
    this.updateMouse(event);
    if (this.ARMode) {
      let tracked = this.reticle.getTrackingState();
      let position = this.reticle.getPosition();
      if (tracked) {
        if (!this.placedModel) {
          this.tweenInModel();
          this.modelScene.position.copy(position);
          this.modelScene.updateMatrixWorld(true);
          let x = this.camera.position.x - this.modelScene.position.x;
          let z = this.camera.position.z - this.modelScene.position.z;
          let angle = Math.atan2(x, z);
          this.modelScene.rotation.set(0, angle + Math.PI * 0.25, 0);
          this.modelScene.updateMatrixWorld(true);
          this.placedModel = true;
          this.reticle.fadeOut(this.duration);
          this.arControls.enable();
          this.dispatchEvent({ type: 'modelPlaced', object: this });
          this.dispatchEvent({ type: 'up', object: this });
        }
      }
    }
  };

  setupReticle = () => {
    let modelSize = this.modelBoundingBox.getSize();
    this.reticle = new Reticle({
      vrDisplay: this.vrDisplay,
      size: Math.max(modelSize.x, modelSize.z),
      easing: 0.5,
    });
    this.reticle.setAlpha(0.0);

    this.reticle.addEventListener('findingSurface', event => {
      if (this.ARMode) {
        this.HUD.findingSurface(event);
      }
    });

    this.reticle.addEventListener('foundSurface', event => {
      if (this.ARMode) {
        this.HUD.foundSurface(event);
      }
    });
  };

  setupARControls = () => {
    this.arControls = new ARControls({
      vrDisplay: this.vrDisplay,
      scene: this.modelScene,
      object: this.model,
      camera: this.camera,
      scene: this.scene,
      canvas: this.canvas,
      debug: this.debug,
    });

    this.arControls.addEventListener('down', () => {
      if (this.ARMode) {
        if (this.arView.marcher) {
          this.arView.controls.enabled = false;
        }
        this.dispatchEvent({ type: 'down', object: this });
      }
    });

    this.arControls.addEventListener('up', () => {
      if (this.ARMode) {
        if (this.arView.marcher) {
          this.arView.controls.enabled = true;
        }
        this.dispatchEvent({ type: 'up', object: this });
      }
    });

    this.arControls.addEventListener('proximityWarning', () => {
      if (this.ARMode) {
        this.dispatchEvent({ type: 'proximityWarning', object: this });
      }
    });

    this.arControls.addEventListener('proximityNormal', () => {
      if (this.ARMode) {
        this.dispatchEvent({ type: 'proximityNormal', object: this });
      }
    });

    this.arControls.addEventListener('onDownPan', () => {
      if (this.ARMode) {
        this.dispatchEvent({ type: 'modelDragged', object: this });
      }
    });

    this.arControls.addEventListener('onDownRotate', () => {
      if (this.ARMode) {
        this.dispatchEvent({ type: 'modelRotated', object: this });
      }
    });
  };

  setupAREffects = () => {
    this.arEffects = new AREffects({
      object: this.model,
      controls: this.arControls,
      scene: this.scene,
      scale: 1.5,
    });
  };

  update = time => {
    if (this.ARMode) {
      this.reticle.update(0.5, 0.5);
      if (this.arControls) this.arControls.update(time);
    } else {
      this.updateSceneRotation(time);
    }

    this.S3DControls.update();
    TWEEN.update(time);
    if (this.HUD) this.HUD.update(time);
  };

  updateSceneRotation = time => {
    if (this.modelScene && !this.FSMode) {
      if (this.lastScrollY) {
        let angle = (this.lastScrollY - window.scrollY) / 1200.0;
        this.S3DScene.rotateY(angle);
      }
    }

    this.lastScrollY = window.scrollY;
  };

  render = () => {
    if (!this.ARMode) this.renderer.render(this.S3DScene, this.S3DCamera);
    if (this.HUD) this.HUD.render();
  };

  onWindowResize = () => {
    if (this.FSMode) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.canvasProps.width = this.canvas.width;
      this.canvasProps.height = this.canvas.height;
    } else {
      let parentRect = this.canvas.parentElement.getBoundingClientRect();
      let width = parentRect.width;
      let height = width / this.canvasProps.aspect;
      this.renderer.setSize(width, height);
      this.canvasProps.width = this.canvas.width;
      this.canvasProps.height = this.canvas.height;
    }
    this.onCanvasResize();
  };

  onCanvasResize = () => {
    if (this.HUD) this.HUD.resize();
    this.updateS3DCamera();
  };
}
