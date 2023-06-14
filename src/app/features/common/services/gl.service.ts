import { Injectable } from '@angular/core';
import * as Pixelmatch from 'pixelmatch';
import * as THREE from 'three';
import { MATCH_THRESHOLD } from '../../app/app.constants';
import { GlProgramSettings } from '../gl-scene/models';
import { GlFactory } from './gl.factory';

interface GlProgram {
    scene: THREE.Scene,
    camera: THREE.Camera,
    material: THREE.ShaderMaterial,
}

@Injectable({
  providedIn: 'root',
})
export class GlService {
    private originalConsoleError: any = null;

    private hasIssue: boolean = false;

    private isRendering: boolean = false;

    constructor(private glFactory: GlFactory) {}

    public async compare(programSettings1: GlProgramSettings, programSettings2: GlProgramSettings, width: number, height: number): Promise<number> {
        const renderer = this.createRenderer();

        const program1 = await this.createProgram(programSettings1, width, height);
        const program2 = await this.createProgram(programSettings2, width, height);

        try {
            return await await this.doCompare(renderer, program1, program2, width, height);
        } finally {
            this.disposeRenderer(renderer);
        }
    }

    public async compareAnimations(programSettings1: GlProgramSettings, programSettings2: GlProgramSettings, width: number, height: number, steps: number, stepTime: number): Promise<number> {
        const renderer = this.createRenderer();

        const program1 = await this.createProgram(programSettings1, width, height);
        const program2 = await this.createProgram(programSettings2, width, height);

        try {
            let matchDegree = 0;
            for (let i = 0; i < steps; i++) {
                program1.material.uniforms['iTime'].value = i * stepTime;
                program2.material.uniforms['iTime'].value = i * stepTime;

                matchDegree += await this.doCompare(renderer, program1, program2, width, height);
            }
            return matchDegree / steps;
        } finally {
            this.disposeRenderer(renderer);
        }
    }

    public async loadTexture(file?: File): Promise<THREE.Texture | null> {
        if (!file || !(file instanceof File)) {
          return Promise.resolve(null);
        }
    
        var loader = new THREE.TextureLoader();
        loader.setCrossOrigin("");
    
        const fileURL = URL.createObjectURL(file);
        const textue = await loader.loadAsync(fileURL);

        if (textue) {
            textue.minFilter = THREE.NearestFilter;
            textue.magFilter = THREE.NearestFilter;
            textue.generateMipmaps = false;
        }

        return textue;
    }

    public async createProgram(settings: GlProgramSettings, width: number, height: number): Promise<GlProgram> {
        const channelsSrc = (settings.channels || []);
        const channels = [];
        for (let i = 0; i < channelsSrc.length; i++) {
            channels.push(await this.loadTexture(channelsSrc[i].file));
        }

        const resolution = new THREE.Vector2(width, height);
        const camera = this.glFactory.createCamera(settings.scene.camera, width, height);
        const scene = this.glFactory.createScene(settings.scene);
        const material = this.glFactory.createMaterial(settings.vertexShader, settings.fragmentShader, resolution, channels, 0);
        const obj = this.glFactory.createObject(settings.scene.object, material);
        scene.add(obj);

        return {scene, camera, material};
    }

    private createRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({ antialias: false, precision: 'highp', premultipliedAlpha: false, preserveDrawingBuffer: true });
        renderer.setPixelRatio(1);
        renderer.autoClear = false;

        let service: GlService = this;
        service.originalConsoleError = console.error.bind(renderer.getContext());

        console.error = function(
            summary, getError, programParamCode, programParam, 
            programLogExample, programLog, vertexErrors, fragmentErrors
        ) {
            if (!service.isRendering) {
                return;
            }

            service.hasIssue = true;
            return service.originalConsoleError(
                summary, getError, programParamCode, programParam, 
                programLogExample, programLog, vertexErrors, fragmentErrors
            );
        };

        return renderer;
    }

    private disposeRenderer(renderer: THREE.WebGLRenderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        console.error = this.originalConsoleError;
    }

    private async doCompare(renderer: THREE.WebGLRenderer, program1: GlProgram, program2: GlProgram, width: number, height: number) {
        const texture1 = await this.renderToTexture(renderer, program1, width, height);
        const texture2 = await this.renderToTexture(renderer, program2, width, height);

        if (texture1 == null || texture2 == null) {
            return 0;
        }

        const mismatches = Pixelmatch(texture1, texture2, null, width, height, { threshold: MATCH_THRESHOLD });

        const matchDegree = 1.0 - mismatches / (width * height);
        return matchDegree;
    }

    private async renderToTexture(renderer: THREE.WebGLRenderer, program: GlProgram, width: number, height: number): Promise<Uint8Array | null> {
        renderer.setSize(width, height);

        const frameTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false, depthBuffer: false });
        const buffer = new Uint8Array(width * height * 4);

        this.hasIssue = false;

        renderer.setRenderTarget(frameTexture);
        this.isRendering = true;
        renderer.render(program.scene, program.camera);
        this.isRendering = false;
        renderer.readRenderTargetPixels(frameTexture, 0, 0, width, height, buffer);

        return this.hasIssue ? null : buffer;
    }
}