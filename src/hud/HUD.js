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

import isMobile from 'is-mobile-with-ipad';

import Grid from './Grid';
import Toast from './Toast';
import CircularButton from './CircularButton';
import Controller from './Controller';
import LoadingIndicator from './LoadingIndicator';

import font from '../fonts/helvetiker_regular_typeface.json';

import * as Icons from '../icons/Icons';

export default class HUD extends THREE.EventDispatcher {
  constructor(props) {
    super(props);
    this.setup(props);
  }

  setup = props => {
    this.setupProperties(props);
    this.loadFont();

    this.setupCamera();
    this.setupScene();
    this.setupGrid();

    this.setupToasts();

    if (this.vrDisplay) {
      this.setupARButton();
    }

    this.setupFSButton();
    this.setupCloseButton();
    if (this.debug) this.setupDebugButton();
    this.setupLoadingIndicator();

    this.FSButton.fadeIn(this.duration);
    if (this.ARButton) this.ARButton.fadeIn(this.duration);
    if (this.debug) this.debugButton.fadeIn(this.duration);

    this.setupController();
  };

  setupProperties = props => {
    this.renderer = props.renderer;
    this.canvas = props.canvas;
    this.vrDisplay = props.vrDisplay;
    this.duration = props.duration;
    this.debug = props.debug;

    this.buttonSize = 36 * this.renderer.getPixelRatio();
    this.buttonIconColor = new THREE.Color(0x777777);
    this.buttonIconAlpha = 1.0;
    this.buttonBackgroundColor = new THREE.Color(0xc0c0c0);
    this.buttonBackgroundAlpha = 0.25;

    this.closeButtonIconColor = new THREE.Color(0xffffff);
    this.closeButtonIconAlpha = 1.0;
    this.closeButtonBackgroundColor = new THREE.Color(0x000000);
    this.closeButtonBackgroundAlpha = this.buttonBackgroundAlpha;

    this.toastTextColor = new THREE.Color(0xffffff);
    this.toastTextAlpha = 0.75;
    this.toastHeight = this.buttonSize * 1.5;
    this.toastBackgroundColor = this.closeButtonBackgroundColor;
    this.toastBackgroundAlpha = this.closeButtonBackgroundAlpha;
    this.topToasts = [];
    this.bottomToasts = [];

    this.spacing = isMobile() ? 24 : 16;
    this.indicatorSize = 128;
  };

  loadFont = () => {
    let loader = new THREE.FontLoader();
    this.font = loader.parse(font);
  };

  setupToasts = () => {
    this.setupMoveDeviceToast();
    this.setupProximityToast();
    this.setupTapToPlaceToast();
    this.setupTouchAndDragToMoveToast();
    this.setupUseTwoFingersToRotateToast();
    this.updateToasts();
  };

  setupMoveDeviceToast = () => {
    this.findingSurfaceToast = new Toast({
      text: 'finding a surface',
      height: this.toastHeight,
      textColor: this.toastTextColor,
      textAlpha: this.toastTextAlpha,
      backgroundColor: this.toastBackgroundColor,
      backgroundAlpha: this.toastBackgroundAlpha,
      font: this.font,
      alpha: 1.0,
    });
    this.findingSurfaceToast.setup();
    this.scene.add(this.findingSurfaceToast);
    this.topToasts.push(this.findingSurfaceToast);
  };

  setupProximityToast = () => {
    this.proximityToast = new Toast({
      text: 'too close, step back',
      height: this.toastHeight,
      textColor: this.toastTextColor,
      textAlpha: this.toastTextAlpha,
      backgroundColor: this.toastBackgroundColor,
      backgroundAlpha: this.toastBackgroundAlpha,
      font: this.font,
      alpha: 1.0,
    });
    this.proximityToast.setup();
    this.scene.add(this.proximityToast);
    this.topToasts.push(this.proximityToast);
  };

  setupTapToPlaceToast = () => {
    this.tapToPlaceToast = new Toast({
      text: 'tap to place',
      height: this.toastHeight,
      textColor: this.toastTextColor,
      textAlpha: this.toastTextAlpha,
      backgroundColor: this.toastBackgroundColor,
      backgroundAlpha: this.toastBackgroundAlpha,
      font: this.font,
      alpha: 1.0,
    });
    this.tapToPlaceToast.setup();
    this.scene.add(this.tapToPlaceToast);
    this.bottomToasts.push(this.tapToPlaceToast);
  };

  setupTouchAndDragToMoveToast = () => {
    this.dragToast = new Toast({
      text: 'touch and drag to move',
      height: this.toastHeight,
      textColor: this.toastTextColor,
      textAlpha: this.toastTextAlpha,
      backgroundColor: this.toastBackgroundColor,
      backgroundAlpha: this.toastBackgroundAlpha,
      font: this.font,
      alpha: 1.0,
    });
    this.dragToast.setup();
    this.scene.add(this.dragToast);
    this.bottomToasts.push(this.dragToast);
  };

  setupUseTwoFingersToRotateToast = () => {
    this.rotateToast = new Toast({
      text: 'use two fingers to rotate',
      height: this.toastHeight,
      textColor: this.toastTextColor,
      textAlpha: this.toastTextAlpha,
      backgroundColor: this.toastBackgroundColor,
      backgroundAlpha: this.toastBackgroundAlpha,
      font: this.font,
      alpha: 1.0,
    });
    this.rotateToast.setup();
    this.scene.add(this.rotateToast);
    this.bottomToasts.push(this.rotateToast);
  };

  updateToasts = () => {
    let size = this.renderer.getDrawingBufferSize();

    for (let i = 0; i < this.bottomToasts.length; i++) {
      let toast = this.bottomToasts[i];
      let toastSize = toast.getSize();
      toast.position.set(
        size.width * 0.5,
        this.spacing + toastSize.height * 0.5,
        0
      );
      toast.updateMatrixWorld(true);
    }

    for (let i = 0; i < this.topToasts.length; i++) {
      let toast = this.topToasts[i];
      let toastSize = toast.getSize();
      toast.position.set(
        size.width * 0.5,
        size.height - (this.spacing + toastSize.height * 0.5),
        0
      );
      toast.updateMatrixWorld(true);
    }
  };

  dismissToasts = duration => {
    for (let i = 0; i < this.bottomToasts.length; i++) {
      this.bottomToasts[i].dismiss(duration);
    }
    for (let i = 0; i < this.topToasts.length; i++) {
      this.topToasts[i].dismiss(duration);
    }
  };

  setupCamera = () => {
    let size = this.renderer.getDrawingBufferSize();
    this.camera = new THREE.OrthographicCamera(
      0,
      size.width,
      size.height,
      0,
      -1,
      1
    );
  };

  setupScene = () => {
    this.scene = new THREE.Scene();
  };

  setupController = () => {
    this.controller = new Controller({
      canvas: this.canvas,
      camera: this.camera,
      scene: this.scene,
    });
  };

  updateCamera = () => {
    let size = this.renderer.getDrawingBufferSize();
    let width = size.width;
    let height = size.height;
    let aspect = width / height;
    this.camera.right = width;
    this.camera.top = height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  };

  setupGrid = () => {
    let size = this.renderer.getDrawingBufferSize();
    this.grid = new Grid({
      width: size.width,
      height: size.height,
      pixelRatio: this.renderer.getPixelRatio(),
      backgroundColor: new THREE.Color(0x000000),
      backgroundAlpha: 0.0,
      gridColor: new THREE.Color(0x000000),
      gridAlpha: 1.0,
      interval: this.spacing,
      alpha: 0.25,
    });
    this.grid.setup();
    if (this.debug) {
      this.scene.add(this.grid);
    }
  };

  updateGrid = () => {
    let size = this.renderer.getDrawingBufferSize();
    this.grid.position.set(size.width * 0.5, size.height * 0.5, 0.0);
    this.grid.setSize(size.width, size.height);
  };

  setupFSButton = () => {
    this.FSButton = new CircularButton({
      width: this.buttonSize,
      height: this.buttonSize,
      pixelRatio: this.renderer.getPixelRatio(),
      iconColor: this.buttonIconColor,
      iconAlpha: this.buttonIconAlpha,
      backgroundColor: this.buttonBackgroundColor,
      backgroundAlpha: this.buttonBackgroundAlpha,
      alpha: 1.0,
      texture: Icons.EnterFullscreen,
    });
    this.FSButton.setup();
    this.FSButton.addEventListener('click', event => {
      this.dispatchEvent({ type: 'fullscreen', object: this.FSButton });
    });
    this.FSButton.fadeOut(0);
    this.scene.add(this.FSButton);
    this.updateFSButton();
  };

  updateFSButton = () => {
    if (this.ARButton) {
      let btnSize = this.FSButton.getSize();
      this.FSButton.position.set(
        this.spacing + btnSize.x * 0.5,
        this.spacing + btnSize.y * 0.5,
        0
      );
    } else {
      let btnSize = this.FSButton.getSize();
      let size = this.renderer.getDrawingBufferSize();
      this.FSButton.position.set(
        size.width - this.spacing - btnSize.x * 0.5,
        this.spacing + btnSize.y * 0.5,
        0.0
      );
    }
  };

  setupARButton = () => {
    this.ARButton = new CircularButton({
      width: this.buttonSize,
      height: this.buttonSize,
      pixelRatio: this.renderer.getPixelRatio(),
      iconColor: this.buttonIconColor,
      iconAlpha: this.buttonIconAlpha,
      backgroundColor: this.buttonBackgroundColor,
      backgroundAlpha: this.buttonBackgroundAlpha,
      alpha: 1.0,
      texture: Icons.EnterAR,
    });
    this.ARButton.setup();
    this.ARButton.addEventListener('click', event => {
      this.dispatchEvent({ type: 'ar', object: this.ARButton });
    });
    this.ARButton.fadeOut(0);
    this.scene.add(this.ARButton);
    this.updateARButton();
  };

  updateARButton = () => {
    let size = this.renderer.getDrawingBufferSize();
    let btnSize = this.ARButton.getSize();
    this.ARButton.position.set(
      size.width - this.spacing - btnSize.x * 0.5,
      this.spacing + btnSize.y * 0.5,
      0.0
    );
  };

  setupCloseButton = () => {
    this.closeButton = new CircularButton({
      width: this.buttonSize,
      height: this.buttonSize,
      pixelRatio: this.renderer.getPixelRatio(),
      iconColor: this.closeButtonIconColor,
      iconAlpha: this.closeButtonIconAlpha,
      backgroundColor: this.closeButtonBackgroundColor,
      backgroundAlpha: this.closeButtonBackgroundAlpha,
      alpha: 1.0,
      texture: Icons.Close,
    });
    this.closeButton.setup();
    this.closeButton.addEventListener('click', event => {
      this.dispatchEvent({ type: 'close', object: this.closeButton });
    });
    this.closeButton.fadeOut(0);
    this.scene.add(this.closeButton);
    this.updateCloseButton();
  };

  updateCloseButton = () => {
    let size = this.renderer.getDrawingBufferSize();
    let btnSize = this.closeButton.getSize();
    if (size.width > size.height) {
      this.closeButton.position.set(
        this.spacing + btnSize.x * 0.5,
        this.spacing + btnSize.y * 0.5,
        0
      );
    } else {
      this.closeButton.position.set(
        this.spacing + btnSize.x * 0.5,
        size.height - this.spacing - btnSize.y * 0.5,
        0
      );
    }
  };

  setupDebugButton = () => {
    this.debugButton = new CircularButton({
      width: this.buttonSize,
      height: this.buttonSize,
      pixelRatio: this.renderer.getPixelRatio(),
      iconColor: this.buttonIconColor,
      iconAlpha: this.buttonIconAlpha,
      backgroundColor: this.buttonBackgroundColor,
      backgroundAlpha: this.buttonBackgroundAlpha,
      alpha: 1.0,
      texture: this.debug ? Icons.GridOff : Icons.GridOn,
    });
    this.debugButton.setup();
    this.debugButton.addEventListener('click', event => {
      this.dispatchEvent({ type: 'debug', object: this.debugButton });
      this.toggleDebug();
      if (this.debugButton.getValue()) {
        this.debugButton.setTexture(Icons.GridOff);
      } else {
        this.debugButton.setTexture(Icons.GridOn);
      }
    });
    this.debugButton.fadeOut(0);
    this.scene.add(this.debugButton);
    this.updateDebugButton();
  };

  updateDebugButton = () => {
    let size = this.renderer.getDrawingBufferSize();
    let btnSize = this.debugButton.getSize();
    let width = size.width;
    let height = size.height;
    this.debugButton.position.set(
      width - this.spacing - btnSize.x * 0.5,
      height - this.spacing - btnSize.x * 0.5,
      0
    );
  };

  toggleDebug = event => {
    this.debug = !this.debug;
    if (this.debug) {
      this.scene.add(this.grid);
    } else {
      this.scene.remove(this.grid);
    }
  };

  setupLoadingIndicator = () => {
    this.loadingIndicator = new LoadingIndicator({
      width: this.indicatorSize,
      height: this.indicatorSize,
      backgroundColor: this.buttonBackgroundColor,
      backgroundAlpha: 0.0,
      color: this.buttonIconColor,
      interval: this.spacing,
      alpha: 1.0,
    });
    this.loadingIndicator.setup();
    this.loadingIndicator.fadeOut(0);
    this.loadingIndicator.fadeIn(this.duration);
    this.scene.add(this.loadingIndicator);
    this.updateLoadingIndicator();
  };

  updateLoadingIndicator = () => {
    let size = this.renderer.getDrawingBufferSize();
    this.loadingIndicator.position.set(size.width * 0.5, size.height * 0.5, 0);
  };

  update = time => {};

  render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  resize = () => {
    this.updateCamera();
    this.updateGrid();
    this.updateFSButton();
    if (this.ARButton) this.updateARButton();
    this.updateCloseButton();
    if (this.debugButton) this.updateDebugButton();
    this.updateLoadingIndicator();
    this.updateToasts();
  };

  hideLoadingIndicator = () => {
    this.loadingIndicator.fadeOut(this.duration, 0.0, () => {
      this.scene.remove(this.loadingIndicator);
    });
  };

  showButtons = (duration, delay, cb) => {
    let dur = duration === undefined ? this.duration : duration;
    this.FSButton.fadeIn(dur, delay, cb);
    if (this.ARButton) this.ARButton.fadeIn(dur, delay, cb);
  };

  hideButtons = (duration, delay, cb) => {
    let dur = duration === undefined ? this.duration : duration;
    this.FSButton.fadeOut(dur, delay, cb);
    if (this.ARButton) this.ARButton.fadeOut(dur, delay, cb);
  };

  resetUserFlow = () => {
    this.userFlowPlaced = false;
    this.userFlowPlacedFirstTime = false;

    this.userFlowDragged = false;
    this.userFlowDraggedFirstTime = false;

    this.userFlowRotated = false;
    this.userFlowRotatedFirstTime = false;
  };

  enterAR = event => {
    this.FSButton.fadeOut(0);
    this.ARButton.fadeOut(0);
    this.closeButton.fadeIn(this.duration);
    this.ARButton.setValue(false);
    this.resetUserFlow();
  };

  exitAR = event => {
    this.closeButton.fadeOut(0);
    this.resetUserFlow();
    this.dismissToasts(this.duration);
  };

  enterFS = event => {
    this.closeButton.fadeIn(this.duration);
    this.FSButton.fadeOut(0);
  };

  exitFS = event => {
    this.closeButton.fadeOut(0);
    this.FSButton.fadeIn(this.duration);
    this.resetUserFlow();
    this.dismissToasts(this.duration);
  };

  down = event => {};

  up = event => {
    if (this.userFlowPlaced && !this.userFlowPlacedFirstTime) {
      this.tapToPlaceToast.dismiss(this.duration, 0);
      this.dragToast.spawn(this.duration, this.duration);
      this.userFlowPlaced = false;
      this.userFlowPlacedFirstTime = true;
    } else if (this.userFlowDragged && !this.userFlowDraggedFirstTime) {
      this.dragToast.dismiss(this.duration, 0);
      this.rotateToast.spawn(this.duration, this.duration);
      this.userFlowDragged = false;
      this.userFlowDraggedFirstTime = true;
      this.userFlowRotated = false;
      this.userFlowRotatedFirstTime = false;
    } else if (this.userFlowRotated && !this.userFlowRotatedFirstTime) {
      this.rotateToast.dismiss(this.duration, 0);
      this.userFlowRotated = false;
      this.userFlowRotatedFirstTime = true;
    }
  };

  modelPlaced = event => {
    this.userFlowPlaced = true;
  };

  modelDragged = event => {
    this.userFlowDragged = true;
  };

  modelRotated = event => {
    this.userFlowRotated = true;
  };

  findingSurface = event => {
    if (!this.userFlowPlaced && !this.userFlowPlacedFirstTime) {
      this.findingSurfaceToast.spawn(this.duration, 0);
    }

    this.tapToPlaceToast.dismiss(this.duration, 0);
    this.userFlowPlaced = false;
  };

  foundSurface = event => {
    this.findingSurfaceToast.dismiss(this.duration, 0);
    if (!this.userFlowPlaced && !this.userFlowPlacedFirstTime) {
      this.tapToPlaceToast.spawn(this.duration, 0);
    }
  };

  proximityWarning = event => {
    this.proximityToast.spawn(this.duration, 0);
  };

  proximityNormal = event => {
    this.proximityToast.dismiss(this.duration, 0);
  };

  getSpacing = () => {
    return this.spacing;
  };

  setSpacing = spacing => {
    this.spacing = spacing;
  };
}
