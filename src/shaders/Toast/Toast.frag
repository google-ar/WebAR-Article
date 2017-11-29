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

uniform float radius;
uniform vec2 size;

uniform vec3 backgroundColor;
uniform float backgroundAlpha;
uniform float alpha;

uniform float time;
uniform vec3 fillColor;


float RoundedRect( vec2 p, vec2 b, float r )
{
    return length( max( abs( p ) - b + r, 0.0 ) ) - r;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv *= size;
  float result = RoundedRect( uv, size, radius );
  result /= max(size.x, size.y);
  result = 1.0 - result;
  result = smoothstep( 0.995, 1.0, result );
  gl_FragColor = vec4( backgroundColor, backgroundAlpha * alpha * result );
}
