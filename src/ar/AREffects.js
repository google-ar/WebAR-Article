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

import Highlight from '../gfx/Highlight';

export default class AREffects extends THREE.EventDispatcher {
  constructor(props) {
    super(props);
    this.setup(props);
  }

  setup = props => {
    this.object = props.object;
    this.controls = props.controls;
    this.scene = props.scene;
    this.scale = props.scale != undefined ? props.scale : 1.0;
    this.duration = props.duration != undefined ? props.duration : 200;

    this.bb = new THREE.Box3();
    this.bb.setFromObject(this.object);
    this.bs = this.bb.getBoundingSphere();
    this.bc = this.bb.getSize();

    this.setupHighlight();
    this.setupEvents();
  };

  setupHighlight = () => {
    this.highlight = new Highlight({
      width: this.bc.x * this.scale,
      height: this.bc.z * this.scale,
    });
    this.highlight.fadeOut(0);
  };

  setupEvents = () => {
    this.startPosY = this.object.position.y;

    this.controls.addEventListener('down', () => {
      this.highlight.quaternion.copy(this.object.getWorldQuaternion());
      this.highlight.position.copy(this.object.getWorldPosition());
      this.scene.add(this.highlight);
      this.highlight.fadeIn(this.duration);
    });

    this.controls.addEventListener('drag', () => {
      this.highlight.quaternion.copy(this.object.getWorldQuaternion());
      this.highlight.position.copy(this.object.getWorldPosition());
    });

    this.controls.addEventListener('up', () => {
      this.highlight.fadeOut(this.duration, 0, () => {
        this.scene.remove(this.highlight);
      });
    });
  };
}
