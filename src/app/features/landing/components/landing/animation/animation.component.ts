import { Component } from '@angular/core';

@Component({
  selector: 'landing-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.css']
})
export class LandingAnimationComponent {

  public vertexShader= `
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  public fragmentShader = `
    uniform vec2 iResolution;
    uniform float iTime;

    vec2 rotate(vec2 position, float angle) {
      float x = position.x * cos(angle) - position.y * sin(angle);
      float y = position.x * sin(angle) + position.y * cos(angle); 
      
      return vec2(x, y);
    }

    float line(vec2 coords, float angle)
    {
      coords = rotate(coords, angle);
      float y = sin(coords.x * 6.28 * 0.75 - iTime * 0.5) * 0.1;

      return 1.0 - smoothstep(0.000, 0.002, abs(y - coords.y));
    }

    float line2(vec2 coords, float angle)
    {
      coords = rotate(coords, angle);
      float y = sin(coords.x * 6.28 * 0.75 - iTime * 0.5) * 0.1;
      y *= -1.0;

      return 1.0 - smoothstep(0.000, 0.002, abs(y - coords.y));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / iResolution.xy;
      uv = uv * 2.0 - 1.0;
      
      vec4 color = vec4(1.0, 1.0, 1.0, 0.0);
      
      float dAngle = 0.04;

      float t1 = 0.0;
      t1 += line(uv, 1.57 * 1.50 + dAngle * 0.0);
      t1 += line(uv, 1.57 * 1.50 + dAngle * 1.0);
      t1 += line(uv, 1.57 * 1.50 + dAngle * 2.0);
      t1 += line(uv, 1.57 * 1.50 + dAngle * 3.0);
      t1 += line(uv, 1.57 * 1.50 + dAngle * 4.0);
      t1 += line(uv, 1.57 * 1.50 + dAngle * 5.0);
      t1 += line(uv, 1.57 * 1.50 + dAngle * 6.0);
      t1 = clamp(t1, 0.0, 1.0);
      color = mix(color, vec4(0.24, 0.33, 0.76, 1.0), t1);
      
      float t2 = 0.0;
      t2 += line2(uv, 1.57 * 1.50 + dAngle * 0.0);
      t2 += line2(uv, 1.57 * 1.50 + dAngle * 1.0);
      t2 += line2(uv, 1.57 * 1.50 + dAngle * 2.0);
      t2 += line2(uv, 1.57 * 1.50 + dAngle * 3.0);
      t2 += line2(uv, 1.57 * 1.50 + dAngle * 4.0);
      t2 += line2(uv, 1.57 * 1.50 + dAngle * 5.0);
      t2 += line2(uv, 1.57 * 1.50 + dAngle * 6.0);
      t2 *= 1.0 - t1;
      t2 = clamp(t2, 0.0, 1.0);
      color = mix(color, vec4(0.52, 0.85, 0.3, 1.0), t2);

      float d1 = distance(uv, vec2(0.0));
      color = mix(vec4(1.0, 1.0, 1.0, 0.0), color, smoothstep(0.0, 0.5, 1.0 - d1));
      
      gl_FragColor = color;
    }
  `;
}
