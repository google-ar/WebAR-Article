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

uniform vec3 backgroundColor;
uniform float backgroundAlpha;

uniform vec3 gridColor;
uniform float gridAlpha;

uniform float alpha;

uniform float time;
uniform float dpr;
uniform float interval;
uniform float aspect;

float Square( vec2 pos, vec2 size ) {
  vec2 v = abs( pos ) - size;
  return max( v.x, v.y );
}

void main() {
  float gridSize = dpr * interval;
  float halfGridSize = gridSize * 0.5;

  vec2 uv = mod( gl_FragCoord.xy, gridSize ) - halfGridSize;
  float grid = Square( uv, vec2( halfGridSize - dpr ) );

  vec4 finalColor = mix(
    vec4( backgroundColor, backgroundAlpha ),
    vec4( gridColor, gridAlpha ),
    clamp( grid, 0.0, 1.0 ) );
  finalColor.a *= alpha;

  gl_FragColor = finalColor;
}
