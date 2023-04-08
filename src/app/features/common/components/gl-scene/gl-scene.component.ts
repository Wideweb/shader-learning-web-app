import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter, HostListener } from '@angular/core';
import * as THREE from 'three';
import { BufferGeometry, Texture } from 'three';
import { GlGeometry, GlScene, GlSceneObject } from '../../gl-scene/models';
import { GlProgramChannel, GlService } from '../../services/gl.service';

export interface GlProgramErrors {
  vertex: { line: number; message: string }[];
  fragment: { line: number; message: string }[];
};

@Component({
  selector: 'app-gl-scene',
  templateUrl: './gl-scene.component.html',
  styleUrls: ['./gl-scene.component.css'],
})
export class GlSceneComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input()
  public vertexShader!: string;

  @Input()
  public fragmentShader!: string;

  @Input()
  public channels: GlProgramChannel[] = [];

  @Input()
  public compileTrigger = 0;

  @Input()
  public maxWidth: number | null = null;

  @Input()
  public ratio: number | null = null;

  @Input()
  public sceneData = new GlScene();

  @Output()
  public onError = new EventEmitter<GlProgramErrors>();

  @Output()
  public onSuccess = new EventEmitter<string>();

  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;

  private camera!: THREE.Camera;

  private isRunning = false;

  private isRendering = false;

  private rafHandle: number = -1;

  private originalConsoleError: any = null;

  private hasIssue = false;

  private notifyStatusChange = true;

  private time = 0;

  private material!: THREE.ShaderMaterial;

  private textures: (Texture | null)[] = [];

  constructor(private elementRef: ElementRef, private glService: GlService) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isRunning) {
      this.setCanvasSize();
      this.material.uniforms['iResolution'].value = new THREE.Vector2(this.canvas.width, this.canvas.height);
      this.renderer.setSize(this.canvas.width, this.canvas.height);
    }
  }

  setCanvasSize() {
    const width = Math.min(this.elementRef.nativeElement.clientWidth, this.maxWidth || Number.MAX_VALUE);
    const height = this.ratio ? width / this.ratio : this.elementRef.nativeElement.clientHeight;

    this.canvas.width = width;
    this.canvas.height = height;
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setCanvasSize();
      this.createRenderer();
      this.createScene();
      this.startRenderingLoop();
    }, 100);
  }

  async ngOnChanges(changes: SimpleChanges) {
    if ('channels' in changes) {
      const texturesFeatures = (this.channels || []).map(async channel => await this.glService.loadTexture(channel.file));
      this.textures = await Promise.all(texturesFeatures);
    }

    if (!this.isRunning && !this.hasIssue) {
      return;
    }

    if (['compileTrigger', 'channels'].some(p => p in changes)) {
      this.restart();
    } else if ('sceneData' in changes) {
      this.createScene();
    }
  }

  restart() {
    if (this.isRunning) {
      this.stopRenderingLoop();
    }

    if (this.renderer) {
      this.renderer.dispose();
      console.error = this.originalConsoleError;
    }

    this.hasIssue = false;
    this.notifyStatusChange = true;

    this.createRenderer();
    this.createScene();
    this.startRenderingLoop();
  }

  ngOnDestroy(): void {
    this.stopRenderingLoop();
  }

  private createRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      precision: 'highp',
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });

    this.renderer.debug.checkShaderErrors = true;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    let component: GlSceneComponent = this;
    component.originalConsoleError = console.error.bind(this.renderer.getContext());

    console.error = function(
        summary: string, getError, programParamCode, programParam, 
        programLogExample, programLog, vertexErrors, fragmentErrors
    ) {
        if (!component.isRendering) {
          return;
        }

        component.hasIssue = true;
        component.stopRenderingLoop();

        const vertexSummaty = summary.split('FRAGMENT')[0];
        const fragmentSummaty = summary.split('FRAGMENT')[1];

        const vertex = component.parseShaderProgramErrors(vertexSummaty, 57);
        const fragment = component.parseShaderProgramErrors(fragmentSummaty, 31);
        
        component.onError.emit({vertex, fragment});

        return component.originalConsoleError(
            summary, getError, programParamCode, programParam, 
            programLogExample, programLog, vertexErrors, fragmentErrors
        );
    };
  }

  private parseShaderProgramErrors(summary: string, lineOffset: number) {
    if (!summary) {
      return [];
    }

    const errorPattern = /ERROR:\s+\d+:(\d+):\s+('.*)/g;
    const matches = [...summary.matchAll(errorPattern)];
    return matches.map(match => {
      const line = match ? Number.parseInt(match[1]) - lineOffset : -1;
      const message = match ? match[2] : '';
      return {line, message};
    });
  }

  private createScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.sceneData.background);

    if (this.sceneData.camera.isOrthographic)
    {
      this.camera = new THREE.OrthographicCamera(
        this.sceneData.camera.left,
        this.sceneData.camera.right,
        this.sceneData.camera.top,
        this.sceneData.camera.bottom,
        this.sceneData.camera.near,
        this.sceneData.camera.far
      );
    }
    else
    {
      this.camera = new THREE.PerspectiveCamera(
        this.sceneData.camera.fov,
        this.canvas.width / this.canvas.height,
        this.sceneData.camera.near,
        this.sceneData.camera.far
      );
    }
    
    this.camera.position.set(
      this.sceneData.camera.position.x,
      this.sceneData.camera.position.y,
      this.sceneData.camera.position.z
    );

    this.addObjectToScene(this.sceneData.object);
  }

  private createBufferGeometry(geometry: GlGeometry): BufferGeometry
  {
    if (geometry == GlGeometry.Triangle)
    {
      var g = new THREE.BufferGeometry();
      var positions = new Float32Array([-0.5,-0.5,0, 0.5,-0.5,0, 0,0.5,0])
      g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return g;
    }

    switch (geometry)
    {
      case GlGeometry.Plane: return new THREE.PlaneGeometry(1, 1);
      case GlGeometry.Box: return new THREE.BoxGeometry(1, 1, 1, 1);
      case GlGeometry.Sphere: return new THREE.SphereGeometry(0.5, 32, 32);
      default: return new THREE.PlaneGeometry(1, 1);
    }
  }

  private addObjectToScene(obj: GlSceneObject): void {
    const geometry = this.createBufferGeometry(Number.parseInt(obj.geometry as any));
    geometry.computeVertexNormals();

    const channelsUniforms = (this.textures || []).reduce((acc, value, i) => ({...acc, [`iChannel${i}`]: { value }}), {});

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        iResolution: { 
          value: new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight),
        },
        ...channelsUniforms,
        iTime: { value: this.time },
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.rotateY(obj.rotation.y);
    mesh.rotateX(obj.rotation.x);
    mesh.rotateZ(obj.rotation.z);
    mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
    mesh.position.set(obj.position.x, obj.position.y, obj.position.z);

    this.scene.add(mesh);
  }

  private startRenderingLoop(): void {
    this.isRunning = true;

    let t0 = performance.now();
    let t1 = t0;

    this.time = 0;

    let component: GlSceneComponent = this;
    (function render() {
      if (component.isRunning) {
        component.rafHandle = requestAnimationFrame(render);
      }

      t1 = performance.now();
      const deltaTime = t1 - t0;
      t0 = t1;

      component.time += deltaTime / 1000;
      component.material.uniforms['iTime'].value = component.time;

      component.isRendering = true;
      component.renderer.render(component.scene, component.camera);
      component.isRendering = false;

      if (component.notifyStatusChange && !component.hasIssue) {
        component.notifyStatusChange = false;
        component.onSuccess.emit();
      }
    }());
  }

  private stopRenderingLoop(): void {
    this.isRendering = false;
    this.isRunning = false;
    cancelAnimationFrame(this.rafHandle);
  }
}
