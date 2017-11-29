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

import Button from './Button';

import vertexShader from '../shaders/CircularButton/CircularButton.vert';
import fragmentShader from '../shaders/CircularButton/CircularButton.frag';

export default class CircularButton extends Button {
  constructor(props) {
    super(props);
    this.props.vertexShader = vertexShader;
    this.props.fragmentShader = fragmentShader;
  }

  setupGeometry = () => {
    this.props.radius = this.props.radius != undefined
      ? this.props.radius
      : Math.max(this.props.width, this.props.height) * 0.75;
    this.geometry = new THREE.CircleBufferGeometry(
      this.props.radius,
      this.props.resolution != undefined ? this.props.resolution : 64
    );
  };

  getSize = () => {
    let size = this.props.radius * 2.0;
    return new THREE.Vector2(size, size);
  };

  getWidth = () => {
    return this.props.radius * 2.0;
  };

  getHeight = () => {
    return this.props.radius * 2.0;
  };

  getRadius = () => {
    return this.props.radius;
  };
}
