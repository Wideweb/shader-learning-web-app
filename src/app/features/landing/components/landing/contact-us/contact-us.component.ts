import { Component } from '@angular/core';
import { GlScene } from 'src/app/features/common/gl-scene/models';
import { Vec3 } from 'src/app/features/common/gl-scene/models';
import { GlGeometry } from 'src/app/features/common/gl-scene/models';

@Component({
  selector: 'landing-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class LandingContactUsComponent {
  public cubeGlScene: GlScene;

  public cube1Vertex = `
    uniform float iTime;

    varying vec3 vNormal;
    varying vec3 vPos;
    
    void main() {
      float angle = iTime * 0.5;
      
      vec4 r1 = vec4(cos(angle), -sin(angle), 0.0, 0.0);
      vec4 r2 = vec4(sin(angle), cos(angle), 0.0, 0.0);
      vec4 r3 = vec4(0.0, 0.0, 1.0, 0.0);
      vec4 r4 = vec4(0.0, 0.0, 0.0, 1.0);
      mat4 transform1 = transpose(mat4(r1, r2, r3, r4));

      r1 = vec4(cos(angle), 0.0, sin(angle), 0.0);
      r2 = vec4(0.0, 1.0, 0.0, 0.0);
      r3 = vec4(-sin(angle), 0.0, cos(angle), 0.0);
      r4 = vec4(0.0, 0.0, 0.0, 1.0);
      mat4 transform2 = transpose(mat4(r1, r2, r3, r4));
      
      vNormal = normalize(mat3(modelMatrix * transform1 * transform2) * normal);
      
      vec4 worldPos = modelMatrix * transform1 * transform2 * vec4(position, 1.0);
      vPos = worldPos.xyz;
      
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  public cube2Vertex = `
    uniform float iTime;

    varying vec3 vNormal;
    varying vec3 vPos;
    
    void main() {
      float angle = iTime * 0.5;
      
      vec4 r1 = vec4(cos(angle), -sin(angle), 0.0, 0.0);
      vec4 r2 = vec4(sin(angle), cos(angle), 0.0, 0.0);
      vec4 r3 = vec4(0.0, 0.0, 1.0, 0.0);
      vec4 r4 = vec4(0.0, 0.0, 0.0, 1.0);
      mat4 transform1 = transpose(mat4(r1, r2, r3, r4));

      r1 = vec4(cos(angle), 0.0, sin(angle), 0.0);
      r2 = vec4(0.0, 1.0, 0.0, 0.0);
      r3 = vec4(-sin(angle), 0.0, cos(angle), 0.0);
      r4 = vec4(0.0, 0.0, 0.0, 1.0);
      mat4 transform2 = transpose(mat4(r1, r2, r3, r4));
      
      vNormal = normalize(mat3(modelMatrix * transform2 * transform1) * normal);
      
      vec4 worldPos = modelMatrix * transform2 * transform1 * vec4(position, 1.0);
      vPos = worldPos.xyz;
      
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  public cube1Fragment = `
    varying vec3 vNormal;
    varying vec3 vPos;
    
    vec3 lightPos = vec3(2.0, -1.0, 4.0);
    
    void main() {
      float diffuse = dot(normalize(vNormal), normalize(lightPos - vPos));
      diffuse = max(diffuse, 0.0);
      
      gl_FragColor = vec4(vec3(0.521, 0.851, 0.298) * (diffuse * 0.5 + 0.5), 1.0);
    }
  `;

  public cube2Fragment = `
    varying vec3 vNormal;
    varying vec3 vPos;
    
    vec3 lightPos = vec3(2.0, 0.0, 4.0);
    
    void main() {
      float diffuse = dot(normalize(vNormal), normalize(lightPos - vPos));
      diffuse = max(diffuse, 0.0);
      
      gl_FragColor = vec4(vec3(0.521, 0.851, 0.298) * (diffuse * 0.5 + 0.5), 1.0);
    }
  `;

  public cube3Fragment = `
    varying vec3 vNormal;
    varying vec3 vPos;
    
    vec3 lightPos = vec3(-2.0, 2.0, 4.0);
    
    void main() {
      float diffuse = dot(normalize(vNormal), normalize(lightPos - vPos));
      diffuse = max(diffuse, 0.0);
      
      gl_FragColor = vec4(vec3(0.521, 0.851, 0.298) * (diffuse * 0.5 + 0.5), 1.0);
    }
  `;

  public cube4Fragment = `
    varying vec3 vNormal;
    varying vec3 vPos;
    
    vec3 lightPos = vec3(-2.0, 1.0, 4.0);
    
    void main() {
      float diffuse = dot(normalize(vNormal), normalize(lightPos - vPos));
      diffuse = max(diffuse, 0.0);
      
      gl_FragColor = vec4(vec3(0.521, 0.851, 0.298) * (diffuse * 0.5 + 0.5), 1.0);
    }
  `;

  constructor() {
    this.cubeGlScene = new GlScene();
    this.cubeGlScene.background = 0x4F6AF4;
    this.cubeGlScene.camera.isOrthographic = false;
    this.cubeGlScene.camera.fov = 45;
    this.cubeGlScene.camera.position = new Vec3(0, 0, 2.5);
    this.cubeGlScene.camera.rotation = new Vec3(0, 0, 0);
    this.cubeGlScene.object.position = new Vec3(0, 0, 0);
    this.cubeGlScene.object.rotation = new Vec3(0.5, 0.5, 0);
    this.cubeGlScene.object.geometry = GlGeometry.Box;
  }
}
