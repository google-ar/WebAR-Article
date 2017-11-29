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

import vertexShader from '../shaders/Toast/Toast.vert';
import fragmentShader from '../shaders/Toast/Toast.frag';

export default class Toast extends View {
  constructor(props) {
    super(props);
    this.props.vertexShader = vertexShader;
    this.props.fragmentShader = fragmentShader;
  }

  setup = () => {
    this.setupText();
    this.setupMaterial();
    this.setupGeometry();
    this.setupMesh();
    this.setupEvents();
    this.fadeOut(0);
  };

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
        size: {
          value: new THREE.Vector2(this.props.width, this.props.height),
        },
        radius: {
          value: Math.min(this.props.width, this.props.height),
        },
        alpha: this.alpha,
        time: {
          value: 0.0,
        },
      },
      vertexShader: this.props.vertexShader,
      fragmentShader: this.props.fragmentShader,
      depthTest: false,
      transparent: true,
    });
  };

  setupText = () => {
    this.alphaTween.onUpdate(this.onAlphaUpdate);
    this.setupTextGeometry();
    this.setupTextMaterial();
    this.setupTextMesh();
  };

  setupTextGeometry = () => {
    this.textGeometry = new THREE.BufferGeometry();
    let shapes = new THREE.ShapeGeometry(
      this.props.font.generateShapes(
        this.props.text,
        16 * window.devicePixelRatio,
        6
      )
    );
    shapes.computeBoundingBox();
    let size = shapes.boundingBox.getSize();
    this.props.width = size.x + 100;
    shapes.translate(
      -size.x * 0.5,
      -size.y * 0.5 + 3 * window.devicePixelRatio,
      0
    );
    this.textGeometry.fromGeometry(shapes);
  };

  setupTextMaterial = () => {
    this.textMaterial = new THREE.MeshBasicMaterial({
      color: this.props.textColor,
      transparent: true,
      opacity: this.props.textAlpha,
      depthTest: false,
    });
  };

  setupTextMesh = () => {
    this.text = new THREE.Mesh(this.textGeometry, this.textMaterial);
    this.text.renderOrder = 2;
    this.add(this.text);
  };

  onAlphaUpdate = event => {
    this.textMaterial.opacity = this.props.textAlpha * this.alpha.value;
  };

  dismiss = (duration, delay, cb) => {
    this.fadeOut(duration, delay, cb);
  };

  spawn = (duration, delay, cb) => {
    this.fadeIn(duration, delay, cb);
  };
}
