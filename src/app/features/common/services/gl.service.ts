import { Injectable } from '@angular/core';
import * as Pixelmatch from 'pixelmatch';
import * as THREE from 'three';
import { MATCH_THRESHOLD } from '../../app/app.constants';

export interface GlProgramChannel {
    file: File
}

export interface GlProgramSettings {
    vertexShader: string;
    fragmentShader: string;
    time?: number;
    channels?: GlProgramChannel[];
}

@Injectable({
  providedIn: 'root',
})
export class GlService {
    private originalConsoleError: any = null;

    private hasIssue: boolean = false;

    private isRendering: boolean = false;

    public async compare(program1: GlProgramSettings, program2: GlProgramSettings): Promise<number> {
        const renderer = this.createRenderer();
        try {
            return await await this.doCompare(renderer, program1, program2);
        } finally {
            this.disposeRenderer(renderer);
        }
    }

    public async compareAnimations(program1: GlProgramSettings, program2: GlProgramSettings, steps: number, stepTime: number): Promise<number> {
        const renderer = this.createRenderer();

        try {
            let matchDegree = 0;
            for (let i = 0; i < steps; i++) {
                matchDegree += await this.doCompare(renderer, {...program1, time: i * stepTime}, {...program2, time: i * stepTime});
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
        console.error = this.originalConsoleError;
        renderer.dispose();
    }

    private async doCompare(renderer: THREE.WebGLRenderer, program1: GlProgramSettings, program2: GlProgramSettings) {
        const width = 1024;
        const height = 512;

        const texture1 = await this.renderToTexture(renderer, program1, width, height);
        const texture2 = await this.renderToTexture(renderer, program2, width, height);


        if (texture1 == null || texture2 == null) {
            return 0;
        }

        const mismatches = Pixelmatch(texture1, texture2, null, width, height, { threshold: MATCH_THRESHOLD });

        const matchDegree = 1.0 - mismatches / (width * height);
        return matchDegree;
    }

    private async renderToTexture(renderer: THREE.WebGLRenderer, program: GlProgramSettings, width: number, height: number): Promise<Uint8Array | null> {
        renderer.setSize(width, height);
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
        camera.position.set(0, 0, 1);

        const channels = (program.channels || []);
        const channelsUniforms = {} as any;
        for (let i = 0; i < channels.length; i++) {
            channelsUniforms[`iChannel${i}`] = { value: await this.loadTexture(channels[i].file) };
        }

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                iResolution: { 
                    value: new THREE.Vector2(width, height),
                },
                ...channelsUniforms,
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

        renderer.setRenderTarget(frameTexture);
        this.isRendering = true;
        renderer.render(scene, camera);
        this.isRendering = false;
        renderer.readRenderTargetPixels(frameTexture, 0, 0, width, height, buffer);

        return this.hasIssue ? null : buffer;
    }
}