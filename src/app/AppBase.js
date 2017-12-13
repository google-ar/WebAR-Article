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

export default class App extends THREE.EventDispatcher {
  constructor(props) {
    super(props);
    THREE.ARUtils.getARDisplay().then(
      function(display) {
        if (display) {
          this.vrDisplay = display;
          this._setup(props);
        } else {
          this.vrDisplay = undefined;
          this._setup(props);
          // THREE.ARUtils.displayUnsupportedMessage();
        }
      }.bind(this)
    );
  }

  _setup = props => {
    this.renderer = new THREE.WebGLRenderer({
      canvas: props.canvas,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;

    this.canvas = props.canvas;
    this.scene = new THREE.Scene();

    if (this.vrDisplay) {
      this.arView = new THREE.ARView(this.vrDisplay, this.renderer);

      // var arDebug = new THREE.ARDebug(this.vrDisplay);
      // let arDebugElemnent = arDebug.getElement();
      // arDebugElemnent.style.top = '10px';
      // arDebugElemnent.style.right = '25px';
      // this.canvas.appendChild(arDebugElemnent);
    }

    if (this.vrDisplay) {
      this.camera = new THREE.ARPerspectiveCamera(
        this.vrDisplay,
        60,
        props.width / props.height,
        this.vrDisplay.depthNear,
        this.vrDisplay.depthFar
      );
    } else {
      this.camera = new THREE.PerspectiveCamera(
        45,
        this.canvas.width / this.canvas.height,
        0.1,
        1000
      );
    }

    this.vrControls = new THREE.VRControls(this.camera);
    this.setup(props);
    this.canvas.addEventListener('resize', this.resize, false);
    this._update();
  };

  // Override these
  setup = props => {};
  update = time => {};
  render = () => {};

  _update = time => {
    this.renderer.clearColor();
    if (this.arView) {
      this.arView.render();
    }
    this.renderer.clearDepth();
    this.camera.updateProjectionMatrix();
    this.vrControls.update();
    this.update(time);
    this.renderer.render(this.scene, this.camera);
    this.render();
    if (this.vrDisplay) {
      this.vrDisplay.requestAnimationFrame(this._update);
    } else {
      requestAnimationFrame(this._update);
    }
  };

  resize = () => {
    let size = this.renderer.getDrawingBufferSize();
    this.camera.aspect = size.width / size.height;
    this.camera.updateProjectionMatrix();
  };
}
