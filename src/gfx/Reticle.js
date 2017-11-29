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

import Fadeable from './Fadeable';

import vertexShader from '../shaders/Reticle/Reticle.vert';
import fragmentShader from '../shaders/Reticle/Reticle.frag';

let tempMatrix = new THREE.Matrix4();
let tempPos = new THREE.Vector3();
let tempQuat = new THREE.Quaternion();
let tempScale = new THREE.Vector3();

let tempCameraPos = new THREE.Vector3();
let tempCameraQuat = new THREE.Quaternion();

export default class Reticle extends Fadeable {
  constructor(props) {
    super(props);
    this.setup(props);
  }

  setup = props => {
    this.setupProperties(props);
    this.setupReticle();
  };

  setupProperties = props => {
    this.props = props;
    this.alpha.value = 1.0;

    this.tracking = { value: 0.0 };
    this.trackingChangeTransitionSpeed = 0.075;
    this.easing = this.props.easing;

    this.trackingState = false;
    this.previousTrackingState = false;

    this.vrDisplay = this.props.vrDisplay;
    if (this.vrDisplay) {
      this.vrFrameData = new VRFrameData();
      this.planeDir = new THREE.Vector3();
      this.startTime = Date.now();
    }
  };

  setupReticle = () => {
    this.setupMaterial();
    this.setupGeometry();
    this.setupMesh();
  };

  setupMaterial = () => {
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        alpha: this.alpha,
        time: {
          value: 0.0,
        },
        tracking: {
          value: 0.0,
        },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  };

  setupGeometry = () => {
    this.geometry = new THREE.PlaneBufferGeometry(
      this.props.size,
      this.props.size
    );
    this.geometry.applyMatrix(
      new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90))
    );
  };

  setupMesh = () => {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.renderOrder = -5;
    this.add(this.mesh);
  };

  update(x = 0.5, y = 0.5) {
    if (!this.vrDisplay || !this.vrDisplay.hitTest || !this.visible) {
      return;
    }

    this.vrDisplay.getFrameData(this.vrFrameData);
    let pose = this.vrFrameData.pose;
    tempCameraQuat.fromArray(pose.orientation);
    tempCameraPos.fromArray(pose.position);

    const hit = this.vrDisplay.hitTest(x, y);
    if (hit && hit.length > 0) {
      tempMatrix.fromArray(hit[0].modelMatrix);
      tempMatrix.decompose(tempPos, tempQuat, tempScale);
      this.mesh.position.lerp(tempPos, this.easing);
      this.mesh.updateMatrixWorld(true);
      this.setTrackingState(true);
    } else {
      tempMatrix.makeRotationFromQuaternion(tempCameraQuat);
      tempPos.set(0, 0, -1.0);
      tempPos.transformDirection(tempMatrix);
      tempCameraPos.addScaledVector(tempPos, this.props.size * 1.5);
      this.mesh.position.lerp(tempCameraPos, this.easing);
      this.setTrackingState(false);
    }

    let scale = THREE.Math.mapLinear(this.alpha.value, 0.0, 1.0, 2.0, 1.0);
    this.mesh.scale.set(scale, scale, scale);
    this.updateUniforms();
  }

  updateUniforms = () => {
    let elapsedMilliseconds = Date.now() - this.startTime;
    let elapsedSeconds = elapsedMilliseconds / 1000;
    this.material.uniforms.time.value = elapsedSeconds;
    this.material.uniforms.tracking.value = this.tracking.value;
  };

  setTrackingState = state => {
    this.trackingState = state;
    let speed = this.trackingChangeTransitionSpeed;
    this.tracking.value += state ? speed : -speed;
    this.tracking.value = Math.max(Math.min(this.tracking.value, 1.0), 0.0);
    this.updateTrackingState();
  };

  updateTrackingState = () => {
    if (this.trackingState !== this.previousTrackingState) {
      if (this.trackingState) {
        this.dispatchEvent({ type: 'foundSurface', object: this });
      } else {
        this.dispatchEvent({ type: 'findingSurface', object: this });
      }
    }
    this.previousTrackingState = this.trackingState;
  };

  getTrackingState = () => {
    return this.trackingState;
  };

  getPosition = () => {
    return this.mesh.position;
  };
}
