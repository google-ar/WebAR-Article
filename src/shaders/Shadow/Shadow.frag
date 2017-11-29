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

precision mediump float;
precision mediump int;

#define PI 3.14159265359
#define TWOPI 6.2831853072

uniform vec3 shadowColor;
uniform float shadowAlpha;

uniform float alpha;

varying vec2 vUv;

void main() {
  vec2 uv = 2.0 * vUv - 1.0;
  gl_FragColor = vec4( shadowColor, alpha * mix( shadowAlpha, 0.0, length(uv) ) );
   // gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}
