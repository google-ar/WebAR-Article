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

import Fadeable from '../gfx/Fadeable';

import vertexShader from '../shaders/View/View.vert';
import fragmentShader from '../shaders/View/View.frag';

export default class View extends Fadeable {
  constructor(props) {
    super(props);
    this.props = props;
    this.props.vertexShader = vertexShader;
    this.props.fragmentShader = fragmentShader;
  }

  setup = () => {
    this.setupMaterial();
    this.setupGeometry();
    this.setupMesh();
    this.setupEvents();
  };

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
      },
      vertexShader: this.props.vertexShader,
      fragmentShader: this.props.fragmentShader,
      transparent: true,
    });
  };

  setupGeometry = () => {
    this.geometry = new THREE.PlaneGeometry(
      this.props.width,
      this.props.height
    );
  };

  setupMesh = () => {
    this.alpha.value = this.props.alpha;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.add(this.mesh);
  };

  setupEvents = () => {};

  setBackgroundColor = color => {
    this.material.uniforms.backgroundColor.value = color;
  };

  setBackgroundAlpha = alpha => {
    this.material.uniforms.backgroundAlpha.value = alpha;
  };

  getSize = () => {
    return new THREE.Vector2(this.props.width, this.props.height);
  };

  getWidth = () => {
    return this.props.width;
  };

  getHeight = () => {
    return this.props.height;
  };
}
