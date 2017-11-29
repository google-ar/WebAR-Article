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

let STATE = {
  ROTATE: 0,
  MOVE: 1,
};

let tempPos = new THREE.Vector3();
let tempQuat = new THREE.Quaternion();
let tempScale = new THREE.Vector3();

let tempCameraPos = new THREE.Vector3();
let tempBox = new THREE.Box3();

export default class ARControls extends THREE.EventDispatcher {
  constructor(props) {
    super(props);
    this.setup(props);
  }

  setup = props => {
    this.vrDisplay = props.vrDisplay;
    if (this.vrDisplay) {
      this.vrFrameData = new VRFrameData();
    }

    this.object = props.object;
    this.scene = props.scene;
    this.camera = props.camera;
    this.canvas = props.canvas;
    this.scene = props.scene;
    this.debug = props.debug != undefined ? props.debug : false;

    this.enabled = false;
    this.down = false;
    this.hit = false;

    this.origin = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.zeroQuat = new THREE.Quaternion();

    this.hitTestFailed = 0;
    this.hitOffset = new THREE.Vector3();
    this.hitOffsetNormalized = new THREE.Vector3();
    this.hitPoint = new THREE.Vector3();
    this.hitPointPrev = new THREE.Vector3();

    this.v0 = new THREE.Vector3();
    this.v1 = new THREE.Vector3();

    this.raycaster = new THREE.Raycaster();

    this.normalizedMouse = new THREE.Vector2();
    this.normalizedMousePrev = new THREE.Vector2();
    this.mouse = new THREE.Vector2();
    this.mousePrev = new THREE.Vector2();

    this.STATE = STATE.PAN;

    this.proximityWarningPrev = false;
    this.proximityWarning = false;

    this.computeBoundingSphere();
  };

  computeBoundingSphere = () => {
    this.bb = new THREE.Box3();
    this.bb.setFromObject(this.object);
    this.bs = this.bb.getBoundingSphere();
    this.size = this.bb.getSize();

    this.box = new THREE.Mesh(
      new THREE.BoxBufferGeometry(this.size.x, this.size.y, this.size.z),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xff0000),
        wireframe: true,
      })
    );
    this.box.quaternion.copy(this.object.getWorldQuaternion());

    let radius = this.bs.radius * 0.5;
    this.cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, this.size.y, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xff00ff),
        wireframe: true,
      })
    );
    this.cylinder.quaternion.copy(this.object.getWorldQuaternion());

    this.sphere = new THREE.Mesh(
      new THREE.IcosahedronBufferGeometry(this.bs.radius, 3),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xff00ff),
        wireframe: true,
      })
    );
    this.sphere.add(this.box);
    this.sphere.add(this.cylinder);

    this.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(20, 20, 40, 40),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xff00ff),
        wireframe: true,
      })
    );
    this.plane.geometry.applyMatrix(
      new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90))
    );
  };

  update = time => {
    if (this.enabled) {
      if (!this.vrDisplay || !this.vrDisplay.hitTest) {
        return;
      }

      this.vrDisplay.getFrameData(this.vrFrameData);
      this.origin.copy(this.object.getWorldPosition());
      this.sphere.position.set(
        this.origin.x,
        this.origin.y + this.bs.center.y,
        this.origin.z
      );

      this.sphere.quaternion.copy(this.object.getWorldQuaternion());
      this.sphere.updateMatrixWorld(true);

      if (this.proximityWarning) {
        this.updateProximity();
      }
    }
  };

  updateProximity = () => {
    tempCameraPos.fromArray(this.vrFrameData.pose.position);

    tempBox.min.copy(this.bb.min);
    tempBox.max.copy(this.bb.max);
    tempBox.expandByScalar(0.075);
    tempBox.applyMatrix4(this.object.matrixWorld);
    this.proximityWarning = tempBox.containsPoint(tempCameraPos);
    if (this.proximityWarning != this.proximityWarningPrev) {
      this.dispatchEvent({
        type: this.proximityWarning ? 'proximityWarning' : 'proximityNormal',
        object: this,
      });
    }
    this.proximityWarningPrev = this.proximityWarning;
  };

  enable = () => {
    this.enabled = true;
    if (this.debug) {
      this.scene.add(this.sphere);
      this.scene.add(this.plane);
    }
    this.plane.position.copy(this.object.getWorldPosition());
    this.plane.updateMatrixWorld(true);
    this.enableEvents();
  };

  enableEvents = () => {
    this.canvas.addEventListener('contextmenu', this.contextmenu, false);

    this.canvas.addEventListener('mousedown', this.mousedown, false);
    this.canvas.addEventListener('mousemove', this.mousemove, false);
    this.canvas.addEventListener('mouseup', this.mouseup, false);

    this.canvas.addEventListener('touchstart', this.touchstart, false);
    this.canvas.addEventListener('touchmove', this.touchmove, false);
    this.canvas.addEventListener('touchend', this.touchend, false);
  };

  disable = () => {
    this.enabled = false;
    if (this.debug) {
      this.scene.remove(this.sphere);
      this.scene.remove(this.plane);
    }

    this.object.quaternion.copy(this.zeroQuat);
    this.disableEvents();
  };

  disableEvents = () => {
    this.canvas.removeEventListener('contextmenu', this.contextmenu);

    this.canvas.removeEventListener('mousedown', this.mousedown);
    this.canvas.removeEventListener('mousemove', this.mousemove);
    this.canvas.removeEventListener('mouseup', this.mouseup);

    this.canvas.removeEventListener('touchstart', this.touchstart);
    this.canvas.removeEventListener('touchmove', this.touchmove);
    this.canvas.removeEventListener('touchend', this.touchend);
  };

  contextmenu = event => {
    event.preventDefault();
  };

  updateMouse = (x, y) => {
    let canvasRect = this.canvas.getBoundingClientRect();
    this.normalizedMousePrev.set(
      this.normalizedMouse.x,
      this.normalizedMouse.y
    );
    this.normalizedMouse.x = (x - canvasRect.left) / canvasRect.width;
    this.normalizedMouse.y = (y - canvasRect.top) / canvasRect.height;

    this.mousePrev.copy(this.mouse);
    this.mouse.x = this.normalizedMouse.x * 2 - 1;
    this.mouse.y = -this.normalizedMouse.y * 2 + 1;
  };

  updateHitOffset = () => {
    this.object.updateMatrixWorld(true);
    this.hitOffset.copy(this.object.getWorldPosition());
    this.hitOffset.project(this.camera);
    this.hitOffset.z = 0.0;

    this.hitOffsetNormalized.copy(this.hitOffset);
    this.hitOffsetNormalized.addScalar(1.0);
    this.hitOffsetNormalized.divideScalar(2.0);
    this.hitOffsetNormalized.y = 1.0 - this.hitOffsetNormalized.y;

    this.hitOffsetNormalized.set(
      this.normalizedMouse.x - this.hitOffsetNormalized.x,
      this.normalizedMouse.y - this.hitOffsetNormalized.y,
      0.0
    );

    this.hitOffset.x = this.mouse.x - this.hitOffset.x;
    this.hitOffset.y = this.mouse.y - this.hitOffset.y;
  };

  updateHit = point => {
    if (!this.vrDisplay || !this.vrDisplay.hitTest) {
      return;
    }
    let hit = this.vrDisplay.hitTest(
      this.normalizedMouse.x - this.hitOffsetNormalized.x,
      this.normalizedMouse.y - this.hitOffsetNormalized.y
    );
    if (hit && hit.length > 0 && this.hitTestFailed === 0) {
      let model = new THREE.Matrix4();
      model.fromArray(hit[0].modelMatrix);
      model.decompose(tempPos, tempQuat, tempScale);
      this.hitPoint.copy(tempPos);
    } else {
      this.hitTestFailed++;
      this.mouse.x = this.mouse.x - this.hitOffset.x;
      this.mouse.y = this.mouse.y - this.hitOffset.y;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      let result = this.raycaster.intersectObjects([this.plane], true);
      if (result && result[0]) {
        this.hitPoint.copy(result[0].point);
      }
    }
  };

  raycast = mouse => {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    let result = this.raycaster.intersectObjects([this.cylinder], false);
    if (result && result[0]) {
      return result[0].point;
    }
  };

  onDown = () => {
    this.updateProximity();
    let point = this.raycast();
    if (point) {
      this.hit = true;
      this.dispatchEvent({
        type: 'down',
        object: this,
      });
      switch (this.STATE) {
        case STATE.PAN:
          this.dispatchEvent({
            type: 'onDownPan',
            object: this,
          });
          this.onDownPan(point);
          break;

        case STATE.ROTATE:
          this.dispatchEvent({
            type: 'onDownRotate',
            object: this,
          });
          this.onDownRotate(point);
          break;
      }
    }
  };

  onDownPan = point => {
    this.updateHitOffset();
    this.updateHit(point);
  };

  onDownRotate = point => {
    this.hitPoint.copy(point);
  };

  onDrag = () => {
    let point = this.raycast();
    this.dispatchEvent({
      type: 'drag',
      object: this,
    });
    switch (this.STATE) {
      case STATE.PAN:
        this.dispatchEvent({
          type: 'onDragPan',
          object: this,
        });
        this.onDragPan(point);
        break;

      case STATE.ROTATE:
        this.dispatchEvent({
          type: 'onDragRotate',
          object: this,
        });
        this.onDragRotate(point);
        break;
    }
  };

  onDragPan = point => {
    this.hitPointPrev.copy(this.hitPoint);
    this.updateHit(point);
    tempPos.subVectors(this.hitPoint, this.hitPointPrev);
    let parent = this.object.parent != undefined
      ? this.object.parent
      : this.object;
    parent.position.set(
      parent.position.x + tempPos.x,
      parent.position.y + tempPos.y,
      parent.position.z + tempPos.z
    );
    parent.updateMatrixWorld(true);
  };

  onDragRotate = point => {
    if (point) {
      this.hitPointPrev.copy(this.hitPoint);
      this.hitPoint.copy(point);
      this.v0.subVectors(this.origin, this.hitPointPrev);
      this.v0.y = 0.0;
      this.v0.normalize();
      this.v1.subVectors(this.origin, this.hitPoint);
      this.v1.y = 0.0;
      this.v1.normalize();
      this.quat.setFromUnitVectors(this.v0, this.v1);
      this.sphere.applyQuaternion(this.quat);
      this.object.applyQuaternion(this.quat);
      this.sphere.applyQuaternion(this.quat);
      this.object.applyQuaternion(this.quat);
    }
  };

  onUp = () => {
    if (this.enabled) {
      if (this.down && this.hit) {
        this.dispatchEvent({
          type: 'up',
          object: this,
        });
      }
    }
    this.hitTestFailed = 0;
    this.down = false;
    this.hit = false;
  };

  mousedown = event => {
    if (this.enabled) {
      this.down = true;
      this.updateMouse(event.clientX, event.clientY);
      if (event.buttons == 2 || event.button == 2) {
        this.STATE = STATE.ROTATE;
      } else {
        this.STATE = STATE.PAN;
      }
      this.onDown();
    }
  };

  mousemove = event => {
    if (this.enabled) {
      if (this.down && this.hit) {
        this.updateMouse(event.clientX, event.clientY);
        this.onDrag();
      }
    }
  };

  mouseup = event => {
    if (this.enabled) {
      this.onUp();
    }
  };

  touchstart = event => {
    if (this.enabled) {
      let t = event.touches;
      let len = t.length;
      if (len) {
        this.down = true;
      }
      switch (len) {
        case 1:
          this.STATE = STATE.PAN;
          this.updateMouse(t[0].clientX, t[0].clientY);
          this.onDown();
          break;

        case 2:
          this.STATE = STATE.ROTATE;
          this.updateMouse(
            (t[0].clientX + t[1].clientX) * 0.5,
            (t[0].clientY + t[1].clientY) * 0.5
          );
          this.onDown();
          break;
      }
    }
  };

  touchmove = event => {
    if (this.enabled) {
      event.preventDefault();
      let t = event.touches;
      let len = t.length;
      if (this.enabled) {
        if (this.down && this.hit && len) {
          this.down = true;
          switch (len) {
            case 1:
              this.STATE = STATE.PAN;
              this.updateMouse(t[0].clientX, t[0].clientY);
              break;

            case 2:
              this.STATE = STATE.ROTATE;
              this.updateMouse(
                (t[0].clientX + t[1].clientX) * 0.5,
                (t[0].clientY + t[1].clientY) * 0.5
              );
              break;
          }
          this.onDrag();
        }
      }
    }
  };

  touchend = event => {
    if (this.enabled) {
      this.onUp();
    }
  };
}
