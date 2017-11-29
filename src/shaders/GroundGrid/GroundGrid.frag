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

#define PI 3.14159265359
#define TWOPI 6.2831853072

uniform vec3 groundColor;
uniform float groundAlpha;
uniform float alpha;

varying vec3 vPos;
varying vec2 vUv;

float Union( float a, float b) {
  return min( a, b);
}

float Line( vec2 pos, vec2 a, vec2 b ) {
  vec2 pa = pos - a;
  vec2 ba = b - a;
  float t = clamp( dot( pa, ba ) / dot( ba, ba ), 0.0, 1.0);
  vec2 pt = a + t * ba;
  return length( pt - pos );
}

float Circle( vec2 pos, float radius ) {
  return length( pos ) - radius;
}

void main() {
  vec2 uv = 2.0 * vUv - 1.0;
  vec2 uv2 = uv;
  float size = 0.05;
  float halfSize = size * 0.5;
  float quarterSize = halfSize * 2.0;
  uv = mod( uv, size ) - halfSize;
  uv2 = mod( uv + vec2( 0.5 ), size ) - halfSize;

  float grid = Line( uv, vec2( 0, -1 ), vec2( 0, 1 ) );
  grid = Union( grid, Line( uv, vec2( -1, 0 ), vec2( 1, 0 ) ) );
  grid = smoothstep( 0.9995, 1.0, 1.0 - grid );

  float subGrid = Line( uv2, vec2( -1, 0 ), vec2( 1, 0 ) );
  subGrid = Union( subGrid, Line( uv2, vec2( 0, -1 ), vec2( 0, 1 ) ) );
  subGrid = smoothstep( 0.999, 1.0, 1.0 - subGrid );

  float circle = Circle( uv2, 0.0015 );
  circle = smoothstep( 0.9995, 1.0, 1.0 - circle );

  float subCircle = Circle( uv, 0.00125 );
  subCircle = smoothstep( 0.9995, 1.0, 1.0 - subCircle );


  float result = max( max( grid, subGrid ), max( circle, subCircle ) );

  gl_FragColor = vec4(
    groundColor,
    alpha * groundAlpha * pow( clamp( 6.0 - length( vPos ), 0.0, 1.0 ), 4.0 ) * result
  );
}
