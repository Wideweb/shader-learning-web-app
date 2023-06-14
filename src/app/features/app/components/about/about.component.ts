import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { GlGeometry, GlScene, Vec3 } from 'src/app/features/common/gl-scene/models';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { ComponentSize } from 'src/app/features/landing/constants';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, AfterViewInit {
  public size: ComponentSize = ComponentSize.Big;

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
    
    vec3 lightPos = vec3(2.0, 3.0, 4.0);
    
    void main() {
      float diffuse = dot(normalize(vNormal), normalize(lightPos - vPos));
      diffuse = max(diffuse, 0.0);
      
      gl_FragColor = vec4(vec3(0.521, 0.851, 0.298) * (diffuse * 0.5 + 0.5), 1.0);
    }
  `;

  public cube2Fragment = `
    varying vec3 vNormal;
    varying vec3 vPos;
    
    vec3 lightPos = vec3(2.0, 1.0, 4.0);
    
    void main() {
      float diffuse = dot(normalize(vNormal), normalize(lightPos - vPos));
      diffuse = max(diffuse, 0.0);
      
      gl_FragColor = vec4(vec3(0.521, 0.851, 0.298) * (diffuse * 0.5 + 0.5), 1.0);
    }
  `;

  public cube3Fragment = `
    varying vec3 vNormal;
    varying vec3 vPos;
    
    vec3 lightPos = vec3(2.0, 2.0, 4.0);
    
    void main() {
      float diffuse = dot(normalize(vNormal), normalize(lightPos - vPos));
      diffuse = max(diffuse, 0.0);
      
      gl_FragColor = vec4(vec3(0.521, 0.851, 0.298) * (diffuse * 0.5 + 0.5), 1.0);
    }
  `;

  get isSmall() {
    return this.size === ComponentSize.Small;
  }

  get isMedium() {
    return this.size === ComponentSize.Medium;
  }

  get isBig() {
    return this.size === ComponentSize.Big;
  }

  constructor(private pageMeta: PageMetaService) {
    this.cubeGlScene = new GlScene();
    this.cubeGlScene.background = 0xFAFAFA;
    this.cubeGlScene.camera.isOrthographic = false;
    this.cubeGlScene.camera.fov = 45;
    this.cubeGlScene.camera.position = new Vec3(0, 0, 2.5);
    this.cubeGlScene.camera.rotation = new Vec3(0, 0, 0);
    this.cubeGlScene.object.position = new Vec3(0, 0, 0);
    this.cubeGlScene.object.rotation = new Vec3(0.5, 0.5, 0);
    this.cubeGlScene.object.geometry = GlGeometry.Box;
  }

  ngAfterViewInit(): void {
    this.resize();
  }

  ngOnInit(): void {
    this.pageMeta.setTitle('Welcome to Shader Learning');
    this.pageMeta.setDescription(`Welcome to Shader Learning, a website dedicatedto teaching you how to program shaders using math and physics. Our site is designed to help beginners and experts alike learn the ins and outs of shader programming through a series of tasksand challenges.`);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resize();
  }

  resize(): void {
    if (window.innerWidth < 640) {
      this.size = ComponentSize.Small;
    } else if (window.innerWidth < 1024) {
      this.size = ComponentSize.Medium;
    } else {
      this.size = ComponentSize.Big;
    }
  }
}
