import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GlCamera, GlGeometry, GlScene, GlSceneObject } from '../gl-scene/models';

@Injectable({
  providedIn: 'root',
})
export class GlFactory {

    public createScene(sceneData: GlScene): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(sceneData.background);
        return scene;
    }

    public createCamera(cameraData: GlCamera, width: number, height: number): THREE.Camera {
        let camera: THREE.Camera | null = null;
    
        if (cameraData.isOrthographic)
        {
          camera = new THREE.OrthographicCamera(
            cameraData.left,
            cameraData.right,
            cameraData.top,
            cameraData.bottom,
            cameraData.near,
            cameraData.far
          );
        }
        else
        {
          camera = new THREE.PerspectiveCamera(
            cameraData.fov,
            width / height,
            cameraData.near,
            cameraData.far
          );
        }
        
        camera.position.set(
          cameraData.position.x,
          cameraData.position.y,
          cameraData.position.z
        );

        camera.rotateY(cameraData.rotation.y);
        camera.rotateX(cameraData.rotation.x);
        camera.rotateZ(cameraData.rotation.z);

        return camera;
    }


    public createObject(obj: GlSceneObject, material: THREE.Material): THREE.Mesh {
        const geometry = this.createBufferGeometry(Number.parseInt(obj.geometry as any));
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateY(obj.rotation.y);
        mesh.rotateX(obj.rotation.x);
        mesh.rotateZ(obj.rotation.z);
        mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
        mesh.position.set(obj.position.x, obj.position.y, obj.position.z);

        return mesh;
    }

    private createBufferGeometry(geometry: GlGeometry): THREE.BufferGeometry {
        if (geometry == GlGeometry.Triangle)
        {
            var positions = new Float32Array([
              -0.5, -0.5, 0.0, // v0
               0.5, -0.5, 0.0, // v1
               0.0,  0.5, 0.0  // v2
            ]);

            var uv = new Float32Array([
              0.0, 0.0, // v0
              1.0, 0.0, // v1
              0.5, 1.0  // v2
            ]);

            var g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));

            return g;
        }
        if (geometry == GlGeometry.SpriteDirectedQuad)
        {
            const positions = new Float32Array( [
              -0.5, -0.7,  0.0, // v0
              -0.5, -0.7,  0.0, // v1
               0.5,  0.7,  0.0, // v2
               0.5,  0.7,  0.0, // v3
            ]);

            const nextPositions = new Float32Array( [
               0.5,  0.7,  0.0, // v2
               0.5,  0.7,  0.0, // v3
              -0.5, -0.7,  0.0, // v0
              -0.5, -0.7,  0.0, // v1
            ]);

            const indices = new Int32Array([0, 1, 2, 3]);

            var texCoord = new Float32Array([
              0.0, 0.0, // v0
              1.0, 0.0, // v1
              0.0, 1.0, // v2
              1.0, 1.0  // v3
            ]);
            
            const bufferIndices = [
              0, 1, 2,
              2, 3, 0,
            ];

            var g = new THREE.BufferGeometry();
            g.setIndex(bufferIndices);
            g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            g.setAttribute('nextPosition', new THREE.BufferAttribute(nextPositions, 3));
            g.setAttribute('index', new THREE.BufferAttribute(indices, 1));
            g.setAttribute('uv', new THREE.BufferAttribute(texCoord, 2));

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

    public createMaterial(vertexShader: string, fragmentShader: string, resolution: THREE.Vector2, channels: (THREE.Texture | null)[], time: number) : THREE.ShaderMaterial {
        const channelsUniforms = (channels || []).reduce((acc, value, i) => ({...acc, [`iChannel${i}`]: { value }}), {});

        const material = new THREE.ShaderMaterial({
            uniforms: {
                iResolution: { 
                    value: resolution,
                  },
                  ...channelsUniforms,
                iTime: { 
                    value: time
                },
            },
            vertexShader,
            fragmentShader,
        });

        return material;
    }
}