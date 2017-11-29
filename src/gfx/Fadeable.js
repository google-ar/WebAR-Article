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

import TWEEN from '@tweenjs/tween.js';

export default class Fadeable extends THREE.Object3D {
  constructor(props) {
    super(props);
    this.alpha = { value: 0.0 };
    this.alphaTween = new TWEEN.Tween(this.alpha);
  }

  onAlphaUpdate = value => {};

  fadeIn = (duration, delay, cb) => {
    this.fadeInCb = cb;
    this.alphaTween.stop();
    this.alphaTween.to({ value: 1.0 }, duration != undefined ? duration : 333);
    this.alphaTween.delay(delay != undefined ? delay : 0);
    this.alphaTween.start();
    this.alphaTween.onComplete(() => {
      if (this.fadeInCb != undefined) {
        this.fadeInCb();
      }
    });
    this.visible = true;
    return this.alphaTween;
  };

  fadeOut = (duration, delay, cb) => {
    this.fadeOutCb = cb;
    this.alphaTween.stop();
    this.alphaTween.to({ value: 0.0 }, duration != undefined ? duration : 333);
    this.alphaTween.delay(delay != undefined ? delay : 0);
    this.alphaTween.onComplete(() => {
      if (this.fadeOutCb != undefined) {
        this.fadeOutCb();
      }
      this.visible = false;
    });
    if (duration === 0) {
      this.visible = false;
      this.setAlpha(0.0);
    }
    this.alphaTween.start();
    return this.alphaTween;
  };

  setAlpha = value => {
    this.alpha.value = value;
  };

  getAlpha = () => {
    return this.alpha.value;
  };
}
