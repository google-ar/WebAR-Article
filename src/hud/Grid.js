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

import vertexShader from '../shaders/Grid/Grid.vert';
import fragmentShader from '../shaders/Grid/Grid.frag';

export default class Grid extends View {
  constructor(props) {
    super(props);
    this.props.vertexShader = vertexShader;
    this.props.fragmentShader = fragmentShader;
  }

  setupMaterial = () => {
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        backgroundColor: {
          value: this.props.backgroundColor,
        },
        backgroundAlpha: {
          value: this.props.backgroundAlpha,
        },
        alpha: this.alpha,
        gridColor: {
          value: this.props.gridColor,
        },
        gridAlpha: {
          value: this.props.gridAlpha,
        },
        dpr: {
          value: this.props.pixelRatio,
        },
        interval: {
          value: this.props.interval,
        },
        aspect: {
          value: this.props.width / this.props.height,
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
  };

  setSize = (width, height) => {
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.mesh.geometry = this.geometry;
    this.mesh.material.uniforms.aspect = width / height;
  };
}
