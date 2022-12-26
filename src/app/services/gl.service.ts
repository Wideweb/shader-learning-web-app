import { Injectable } from '@angular/core';
import * as Pixelmatch from 'pixelmatch';
import * as THREE from 'three';
import { MATCH_THRESHOLD } from '../app.constants';

@Injectable({
  providedIn: 'root',
})
export class GlService {
    private originalConsoleError: any = null;

    private hasIssue: boolean = false;

    public renderToTexture(vertexShader: string, fragmentShader: string, width: number, height: number): Uint8Array | null {
        const renderer = new THREE.WebGLRenderer({ alpha: false, antialias : false, precision: 'highp', premultipliedAlpha: false, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.autoClear = false;

        let service: GlService = this;
        service.originalConsoleError = console.error.bind(renderer.getContext());

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

        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                iResolution: { 
                    value: new THREE.Vector2(width, height),
                },
                iTime: { value: 0.0 },
            },
            vertexShader,
            fragmentShader,
            blending: 0
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0.5, 0.5, 0);
        scene.add(plane);

        const frameTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false, depthBuffer: false });
        const buffer = new Uint8Array(width * height * 4);

        this.hasIssue = false;

        renderer.setRenderTarget(frameTexture);
        renderer.render(scene, camera);
        renderer.readRenderTargetPixels(frameTexture, 0, 0, width, height, buffer);

        console.error = this.originalConsoleError;

        return this.hasIssue ? null : buffer;
    }

    public compare(vertexShader1: string, fragmentShader1: string, vertexShader2: string, fragmentShader2: string): number {
        const width = 256;
        const height = 256;

        const texture1 = this.renderToTexture(vertexShader1, fragmentShader1, width, height);
        const texture2 = this.renderToTexture(vertexShader2, fragmentShader2, width, height);

        if (texture1 == null || texture2 == null) {
            return 0;
        }

        const mismatches = Pixelmatch(texture1, texture2, null, width, height, { threshold: MATCH_THRESHOLD, includeAA: true });

        const matchDegree = 1.0 - mismatches / (width * height);
        return matchDegree;
    }
}