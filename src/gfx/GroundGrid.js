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

import vertexShader from '../shaders/GroundGrid/GroundGrid.vert';
import fragmentShader from '../shaders/GroundGrid/GroundGrid.frag';

export default class GroundGrid extends Fadeable {
  constructor(props) {
    super(props);
    this.setup(props);
  }

  setup = props => {
    this.props = props;
    this.setupMesh(props);
  };

  setupMesh = props => {
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        groundColor: {
          value: props.gridColor,
        },
        groundAlpha: {
          value: props.gridAlpha,
        },
        alpha: this.alpha,
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      transparent: true,
    });

    this.geometry = new THREE.PlaneGeometry(10, 10, 2, 2);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.geometry.applyMatrix(
      new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90))
    );
    this.mesh.renderOrder = 1;
    this.add(this.mesh);
  };
}
