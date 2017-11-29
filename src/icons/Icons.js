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

import fsTextureURL from './ic_fullscreen_white_32dp_2x.png';
import fseTextureURL from './ic_fullscreen_exit_white_32dp_2x.png';
import arTextureURL from './ic_view_in_ar_white_32dp_2x.png';
import gridTextureURL from './ic_grid_white_32dp_2x.png';
import gridOffTextureURL from './ic_grid_off_white_32dp_2x.png';
import xTextureURL from './ic_close_white_32dp_2x.png';

const fsTexture = new THREE.TextureLoader().load(fsTextureURL);
const fseTexture = new THREE.TextureLoader().load(fseTextureURL);
const arTexture = new THREE.TextureLoader().load(arTextureURL);
const gridTexture = new THREE.TextureLoader().load(gridTextureURL);
const gridOffTexture = new THREE.TextureLoader().load(gridOffTextureURL);
const xTexture = new THREE.TextureLoader().load(xTextureURL);

let textures = [
  fsTexture,
  fseTexture,
  arTexture,
  gridTexture,
  gridOffTexture,
  xTexture,
];

for (let i = 0; i < textures.length; i++) {
  let texture = textures[i];
  texture.anisotropy = 8.0;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
}

export { fsTexture as EnterFullscreen };
export { fseTexture as ExitFullscreen };
export { arTexture as EnterAR };
export { xTexture as Close };
export { gridTexture as GridOn };
export { gridOffTexture as GridOff };
