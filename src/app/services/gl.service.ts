import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class GlService {
    private originalConsoleError: any = null;

    private hasIssue: boolean = false;

    public renderToTexture(vertexShader: string, fragmentShader: string, width: number, height: number): Uint8Array | null {
        const renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(1);
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
                resolution: { 
                value: new THREE.Vector2(width, height),
                },
                time: { value: 0.0 },
            },
            vertexShader,
            fragmentShader,
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(0.5, 0.5, 0);
        scene.add(plane);

        const frameTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });
        const buffer = new Uint8Array(width * height * 4);

        this.hasIssue = false;

        renderer.setRenderTarget(frameTexture);
        renderer.render(scene, camera);
        renderer.readRenderTargetPixels(frameTexture, 0, 0, width, height, buffer);

        console.error = this.originalConsoleError;

        return this.hasIssue ? null : buffer;
    }
}