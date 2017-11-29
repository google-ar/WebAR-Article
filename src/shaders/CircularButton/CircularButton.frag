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

precision highp float;
precision highp int;

uniform sampler2D tex;

varying vec2 vUv;

uniform vec3 iconColor;
uniform vec3 backgroundColor;
uniform float iconAlpha;
uniform float backgroundAlpha;
uniform float alpha;


void main() {
  float scale = 3.0;
  vec2 uv = vUv * scale - scale * 0.5;
  uv += 1.0;
  uv /= 2.0;
  vec4 icon = texture2D( tex, uv );
  vec4 background = vec4( backgroundColor, backgroundAlpha );
  vec4 finalColor = mix(
    background,
    icon * vec4( iconColor, iconAlpha ),
    // ceil(icon.a) );
    icon.a );
  finalColor.a *= alpha;
  gl_FragColor = finalColor;
}
