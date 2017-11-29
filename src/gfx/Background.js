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
import vertexShader from '../shaders/Background/Background.vert';
import fragmentShader from '../shaders/Background/Background.frag';

export default class Background extends Fadeable {
  constructor(props) {
    super(props);
    this.setup(props);
  }

  setup = props => {
    this.props = props;
    this.setupMesh(props);
  };

  setupMesh = props => {
    this.alpha.value = props.alpha;
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        skyColor: {
          value: props.skyColor,
        },
        groundColor: {
          value: props.groundColor,
        },
        alpha: this.alpha,
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      // depthWrite: false,
      transparent: true,
    });

    this.geometry = new THREE.IcosahedronBufferGeometry(5, 4);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.renderOrder = -3;
    this.add(this.mesh);
  };

  setPosition = (x, y, z) => {
    this.mesh.position.set(x, y, z);
  };
}
