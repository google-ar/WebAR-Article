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

#define PI 3.141592920
#define TWO_PI 6.2831853072

uniform float alpha;
uniform float time;
uniform float tracking;

varying vec2 vUv;

float Arc( in vec2 pos, float radius, float thickness, float angle, float offset) {
  vec2 pr = vec2( length(pos), atan(pos.y, pos.x) + PI);
  float dist = pr.x - radius;
  dist = abs( dist ) - thickness;
  vec2 a = normalize( pos );
  vec2 b = normalize( vec2( cos( offset ), sin( offset ) ) );
  float theta = acos( dot( a, b ) );
  float arc = theta - angle * 0.5;
  return max( arc, dist );
}

void main(void)
{
  vec2 uv = 2.0 * vUv - 1.0;
  float arc = Arc(
    uv,
    0.5,
    0.02,
    mix( ( abs( sin( time * 2.0 ) ) ) * PI, TWO_PI, tracking ),
    -fract( time ) * TWO_PI - PI);
  arc = smoothstep( 0.01, 0.0, arc );

  float arc2 = Arc(uv, 0.5, 0.02, TWO_PI, 0.0 );
  arc2 = smoothstep( 0.01, 0.0, arc2 );

  float arc3 = Arc(uv, 0.5, 0.03, TWO_PI, 0.0 );
  arc3 = smoothstep( 0.01, 0.0, arc3 );

  vec4 shadowColor = vec4( 1.0, 1.0, 1.0, 0.25 );
  vec4 fillColor = vec4( 1.0, 1.0, 1.0, 1.0 );
  vec4 backgroundColor = vec4( 1.0, 1.0, 1.0, 0.0 );

  vec4 color = mix( vec4( 0.0 ), backgroundColor, arc3 );
  color = mix( color, shadowColor, arc2 );
  color = mix( color, fillColor, mix( arc, arc * abs( sin( time * 4.0 ) ), tracking ) );
  color.a *= alpha;
  gl_FragColor = color;
}

