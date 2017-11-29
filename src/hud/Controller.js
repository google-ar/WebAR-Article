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

export default class Controller {
  constructor(props) {
    this.setup(props);
  }

  setup = props => {
    this.scene = props.scene;
    this.camera = props.camera;
    this.canvas = props.canvas;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.canvas.addEventListener('mousedown', this.onClick, false);
  };

  onClick = event => {
    let canvasRect = this.canvas.getBoundingClientRect();
    this.mouse.x = (event.clientX - canvasRect.left) / canvasRect.width * 2 - 1;
    this.mouse.y =
      -(event.clientY - canvasRect.top) / canvasRect.height * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
      let object = intersects[i].object;
      let parent = object.parent;
      if (parent) {
        parent.dispatchEvent({
          type: 'click',
          object: parent,
        });
      }
    }
  };
}
