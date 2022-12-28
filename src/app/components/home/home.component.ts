import { Component } from '@angular/core';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public vertexShader= `
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

    public fragmentShader = `
    uniform vec2 iResolution;
    uniform float iTime;

    #define SCALE 2.0
    #define PI 3.14159265358979
    #define TAU 6.283185307179586
    #define CL(x,a,b) smoothstep(0.0,1.0,(2.0/3.0)*(x-a)/(b-a)+(1.0/6.0))*(b-a)+a // https://www.shadertoy.com/view/Ws3Xzr

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution)/ iResolution.y * SCALE;
        
        float st = radians(-31.0); // start position (180 = inf)
        float t = st+(iTime*TAU)/3600.0; // #sec for num line
        float n = (cos(t) > 0.0) ? sin(t): 1.0/sin(t); // time to sin/csc
        float az = pow(500.0, n); // autozoom
        az = clamp(az, CL(az, 1e-16, 1e-15), CL(az, 1e+17, 1e+18)); // clamp at precision lost
        uv *= az;
        vec3 c = vec3(0); // black background
        float a = atan(uv.y, uv.x)+(PI/2.0); // arc radian
        float i = a/TAU; // spiral increment 0.5 per 180°
        float l = pow(length(uv), 0.5/n); // logarithmic (archimedean at 0.5)
        float r = l-i; // spiral radius
        float ls = (iTime*TAU)/5.0; // light animation speed
        c += sin(ls+pow(TAU*ceil(r)+a, 2.0)/(2.0*TAU*n)); // segmented spiral magic
        c *= pow(abs(sin(r*PI)), abs(n*2.0)+5.0); // smooth edges & thin near inf
        float vd = (ceil(r)*TAU+a)/n; // visual denominator
        c *= sin(vd*(ceil(r)+i)+PI/2.0+ls*2.0); // this looks nice
        c *= 0.2+abs(cos(vd)); // dark spirals
        c = min(c, pow(length(uv)/az, -1.0/n)); // dark gradient
        vec3 rgb = vec3(cos(vd)+1.0, abs(sin(t)), -cos(vd)+1.0); // color
        c += (c*2.0)-(rgb*0.5); // add color

        gl_FragColor = vec4(c, 1.0);
    }
    `;
}
