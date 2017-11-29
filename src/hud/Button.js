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

import vertexShader from '../shaders/Button/Button.vert';
import fragmentShader from '../shaders/Button/Button.frag';

export default class Button extends View {
  constructor(props) {
    super(props);
    this.props.vertexShader = vertexShader;
    this.props.fragmentShader = fragmentShader;
  }

  setupMaterial = () => {
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        iconColor: {
          value: this.props.iconColor,
        },
        iconAlpha: {
          value: this.props.iconAlpha,
        },
        backgroundColor: {
          value: this.props.backgroundColor,
        },
        backgroundAlpha: {
          value: this.props.backgroundAlpha,
        },
        alpha: this.alpha,
        tex: {
          value: this.props.texture,
        },
      },
      vertexShader: this.props.vertexShader,
      fragmentShader: this.props.fragmentShader,
      transparent: true,
    });
  };

  setupEvents = () => {
    this.state = { value: false };
    this.addEventListener('click', () => {
      this.setValue(!this.getValue());
    });
  };

  setIconColor = color => {
    this.material.uniforms.iconColor.value = color;
  };

  setIconAlpha = alpha => {
    this.material.uniforms.iconAlpha.value = alpha;
  };

  setTexture = texture => {
    this.material.uniforms.tex.value = texture;
  };

  getState = () => {
    return this.state;
  };

  setState = state => {
    this.state = state;
  };

  getValue = () => {
    return this.state.value;
  };

  setValue = value => {
    this.state.value = value;
  };
}
