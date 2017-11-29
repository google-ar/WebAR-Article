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

varying vec2 vUv;

uniform vec3 backgroundColor;
uniform float backgroundAlpha;
uniform float alpha;

uniform float time;
uniform vec3 fillColor;

#define PI 3.141592920
#define TWO_PI 6.2831853072

float Arc( in vec2 pos, float radius, float thickness, float angle, float offset) {
  vec2 pr = vec2( length(pos), atan(pos.y, pos.x) + PI);
  float dist = pr.x - radius;
  dist = abs( dist ) - thickness;
  vec2 a = normalize( pos );
  vec2 b = normalize( vec2( cos( offset ), sin( offset ) ) );
  float theta = acos( dot( a, b ) );
  float arc = theta - angle;
  return max( arc, dist );
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float arc = Arc(uv, 0.75, 0.075, ( abs( sin( time ) ) ) * PI, -fract( time ) * TWO_PI - PI );
  arc = smoothstep( 0.01, 0.0, arc );
  vec4 background = vec4( backgroundColor, backgroundAlpha );
  vec4 finalColor = mix( background, vec4( fillColor, arc ), arc );
  finalColor.a *= alpha;
  gl_FragColor = finalColor;
}
