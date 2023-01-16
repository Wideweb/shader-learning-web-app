import { Injectable } from '@angular/core';
import * as Pixelmatch from 'pixelmatch';
import * as THREE from 'three';
import { MATCH_THRESHOLD } from '../../app/app.constants';

export interface GlProgramSettings {
    iChannel0: File | boolean | null;
    iChannel1: File | boolean | null;
    vertexShader: string;
    fragmentShader: string;
    time?: number;
}

@Injectable({
  providedIn: 'root',
})
export class GlService {
    private renderer: THREE.WebGLRenderer;

    private originalConsoleError: any = null;

    private hasIssue: boolean = false;

    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias :false, precision: 'highp', premultipliedAlpha: false, preserveDrawingBuffer: true });
    }

    public async renderToTexture(program: GlProgramSettings, width: number, height: number): Promise<Uint8Array | null> {
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(width, height);
        this.renderer.autoClear = false;

        let service: GlService = this;
        service.originalConsoleError = console.error.bind(this.renderer.getContext());

        console.error = function(
            summary, getError, programParamCode, programParam, 
            programLogExample, programLog, vertexErrors, fragmentErrors
        ) {

            service.hasIssue = true;
            return service.originalConsoleError(
                summary, getError, programParamCode, programParam, 
                programLogExample, programLog, vertexErrors, fragmentErrors
            );
        };
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
        camera.position.set(0, 0, 1);

        const iChannel0 = await this.loadTexture(program.iChannel0);
        const iChannel1 = await this.loadTexture(program.iChannel1);

        console.log(program.time);

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                iResolution: { 
                    value: new THREE.Vector2(width, height),
                },
                iChannel0: {
                    value: iChannel0
                },
                iChannel1: {
                    value: iChannel1
                },
                iTime: { 
                    value: program.time
                },
            },
            vertexShader: program.vertexShader,
            fragmentShader: program.fragmentShader,
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0.5, 0.5, 0);
        scene.add(plane);

        const frameTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false, depthBuffer: false });
        const buffer = new Uint8Array(width * height * 4);

        this.hasIssue = false;

        this.renderer.setRenderTarget(frameTexture);
        this.renderer.render(scene, camera);
        this.renderer.readRenderTargetPixels(frameTexture, 0, 0, width, height, buffer);

        console.error = this.originalConsoleError;

        return this.hasIssue ? null : buffer;
    }

    public async compare(program1: GlProgramSettings, program2: GlProgramSettings): Promise<number> {
        const width = 256;
        const height = 256;

        const texture1 = await this.renderToTexture(program1, width, height);
        const texture2 = await this.renderToTexture(program2, width, height);

        if (texture1 == null || texture2 == null) {
            return 0;
        }

        const mismatches = Pixelmatch(texture1, texture2, null, width, height, { threshold: MATCH_THRESHOLD, includeAA: true });

        const matchDegree = 1.0 - mismatches / (width * height);
        return matchDegree;
    }

    public async compareAnimations(program1: GlProgramSettings, program2: GlProgramSettings, steps: number, stepTime: number): Promise<number> {
        let matchDegree = 0;
        for (let i = 0; i < steps; i++) {
            const m = await this.compare({...program1, time: i * stepTime}, {...program2, time: i * stepTime});
            console.log(m);
            matchDegree += m
        }
        return matchDegree / steps;
    }

    public async loadTexture(file: File | boolean | null): Promise<THREE.Texture | null> {
        if (!file || !(file instanceof File)) {
          return Promise.resolve(null);
        }
    
        var loader = new THREE.TextureLoader();
        loader.setCrossOrigin("");
    
        const fileURL = URL.createObjectURL(file);
        return await loader.loadAsync(fileURL);
    }
}