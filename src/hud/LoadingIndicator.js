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

import View from './View';

import vertexShader from '../shaders/LoadingIndicator/LoadingIndicator.vert';
import fragmentShader from '../shaders/LoadingIndicator/LoadingIndicator.frag';

export default class LoadingIndicator extends View {
  constructor(props) {
    super(props);
    this.props.vertexShader = vertexShader;
    this.props.fragmentShader = fragmentShader;
  }

  setupMaterial = () => {
    this.startTime = Date.now();
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        backgroundColor: {
          value: this.props.backgroundColor,
        },
        backgroundAlpha: {
          value: this.props.backgroundAlpha,
        },
        fillColor: {
          value: this.props.color,
        },
        alpha: this.alpha,
        time: {
          value: 0.0,
        },
      },
      vertexShader: this.props.vertexShader,
      fragmentShader: this.props.fragmentShader,
      transparent: true,
    });
  };

  setupMesh = () => {
    this.alpha.value = this.props.alpha;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
    this.mesh.onBeforeRender = this.update;
  };

  update = () => {
    let elapsedMilliseconds = Date.now() - this.startTime;
    let elapsedSeconds = elapsedMilliseconds / 1000;
    this.material.uniforms.time.value = elapsedSeconds;
  };
}
