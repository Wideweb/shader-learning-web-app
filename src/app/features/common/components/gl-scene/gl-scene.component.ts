import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter, HostListener } from '@angular/core';
import * as THREE from 'three';
import { Texture } from 'three';
import { GlProgramChannel, GlService } from '../../services/gl.service';

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

  @Output()
  public onError = new EventEmitter<{line: number; message: string}[]>();

  @Output()
  public onSuccess = new EventEmitter<string>();

  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;

  private camera!: THREE.OrthographicCamera;

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
      const width = this.elementRef.nativeElement.clientWidth;
      const height = this.elementRef.nativeElement.clientHeight;

      this.canvas.width = width;
      this.canvas.height = height;

      this.material.uniforms['iResolution'].value = new THREE.Vector2(width, height);

      this.renderer.setSize(width, height);
    }
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
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
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, precision: 'highp', premultipliedAlpha: false, preserveDrawingBuffer: true })
    this.renderer.debug.checkShaderErrors = true;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: GlSceneComponent = this;
    component.originalConsoleError = console.error.bind(this.renderer.getContext());

    const canvas = this.canvas;

    console.error = function(
        summary: string, getError, programParamCode, programParam, 
        programLogExample, programLog, vertexErrors, fragmentErrors
    ) {
        if (!component.isRendering) {
          return;
        }

        component.hasIssue = true;
        component.stopRenderingLoop();

        const errorPattern = /ERROR:\s+\d+:(\d+):\s+('.*)/g;
        const matches = [...summary.matchAll(errorPattern)];
        const errors = matches.map(match => {
          const line = match ? Number.parseInt(match[1]) - 31 : -1;
          const message = match ? match[2] : '';
          return {line, message};
        });
        
        component.onError.emit(errors);

        return component.originalConsoleError(
            summary, getError, programParamCode, programParam, 
            programLogExample, programLog, vertexErrors, fragmentErrors
        );
    };
  }

  private createScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
    this.camera.position.set(0, 0, 1);

    this.addPlaneToScene();
  }

  private addPlaneToScene(): void {
    const geometry = new THREE.PlaneGeometry(1, 1);

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

    const plane = new THREE.Mesh(geometry, this.material);
    plane.position.set(0.5, 0.5, 0);
    this.scene.add(plane);
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
