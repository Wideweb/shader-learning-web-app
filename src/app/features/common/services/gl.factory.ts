import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GlCamera, GlGeometry, GlScene, GlSceneObject } from '../gl-scene/models';

interface Vec3 {
  x: number;
  y: number;
  z: number;
};

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

        if (geometry == GlGeometry.SpriteCircle)
        {
          const segments = 10;
          const angleDelta = 6.28 / segments;
          const yDelta = 2.0 / segments;

          const positionData: number[] = [];
          const texCoordData: number[] = [];
          const indexData: number[] = [];
          const indices: number[] = [];
          
          for (let i = 0; i < segments; i++)
          {
            const x = Math.cos(angleDelta * i) * 0.75;
            const y = Math.sin(angleDelta * i) * 0.75;
            const z = 0;

            positionData.push(x, y, z);
            positionData.push(x, y, z);

            if (i % 2 == 0)
            {
              texCoordData.push(0.0, 0.0);
              texCoordData.push(1.0, 0.0);
            }
            else
            {
              texCoordData.push(0.0, 1.0);
              texCoordData.push(1.0, 1.0);
            }

            indexData.push(indexData.length);
            indexData.push(indexData.length);

            if (i > 0)
            {
              const indexOffset = (i - 1) * 2;
              indices.push(indexOffset + 0, indexOffset + 1, indexOffset + 2);
              indices.push(indexOffset + 3, indexOffset + 2, indexOffset + 1);
            }
          }

          const indexOffset = (segments - 1) * 2;
          indices.push(indexOffset + 0, indexOffset + 1, 0);
          indices.push(1, 0, indexOffset + 1);

          const prevPositionData: number[] = [];
          const nextPositionData: number[] = [];

          for (let i = 0; i < segments * 2; i += 2)
          {
            if (i > 0)
            {
              const prevX = positionData[(i - 2) * 3 + 0];
              const prevY = positionData[(i - 2) * 3 + 1];
              const prevZ = positionData[(i - 2) * 3 + 2];
              prevPositionData.push(prevX, prevY, prevZ);
              prevPositionData.push(prevX, prevY, prevZ);
            }
            else
            {
              const prevX = positionData[(segments - 1) * 2 * 3 + 0];
              const prevY = positionData[(segments - 1) * 2 * 3 + 1];
              const prevZ = positionData[(segments - 1) * 2 * 3 + 2];
              prevPositionData.push(prevX, prevY, prevZ);
              prevPositionData.push(prevX, prevY, prevZ);
            }

            if (i < segments * 2 - 2)
            {
              const nextX = positionData[(i + 2) * 3 + 0];
              const nextY = positionData[(i + 2) * 3 + 1];
              const nextZ = positionData[(i + 2) * 3 + 2];
              nextPositionData.push(nextX, nextY, nextZ);
              nextPositionData.push(nextX, nextY, nextZ);
            }
            else
            {
              const nextX = positionData[0];
              const nextY = positionData[1];
              const nextZ = positionData[2];
              nextPositionData.push(nextX, nextY, nextZ);
              nextPositionData.push(nextX, nextY, nextZ);
            }
          }
          
          var g = new THREE.BufferGeometry();
          g.setIndex(indices);
          g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positionData), 3));
          g.setAttribute('prevPosition', new THREE.BufferAttribute(new Float32Array(prevPositionData), 3));
          g.setAttribute('nextPosition', new THREE.BufferAttribute(new Float32Array(nextPositionData), 3));
          g.setAttribute('index', new THREE.BufferAttribute(new Int32Array(indexData), 1));
          g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(texCoordData), 2));

          return g;
        }

        if (geometry == GlGeometry.SpriteCircleQuad)
        {
          const segments = 10;
          const angleDelta = 6.28 / segments;
          const yDelta = 2.0 / segments;

          const points: Vec3[] = [];
          
          for (let i = 0; i < segments; i++)
          {
            const x = Math.cos(angleDelta * i) * 0.75;
            const y = Math.sin(angleDelta * i) * 0.75;
            const z = 0;

            points.push({x, y, z});
          }

          const positionData: number[] = [];
          const prevPositionData: number[] = [];
          const nextPositionData: number[] = [];
          const texCoordData: number[] = [];
          const indexData: number[] = [];
          const dUV: number[] = [];
          const indices: number[] = [];

          for (let i = 0; i < segments; i++)
          {
            const prevIdx  = i;
            const currIdx  = (i + 1) % segments;
            const next1Idx = (i + 2) % segments;
            const next2Idx = (i + 3) % segments;

            const prevPoint = points[prevIdx];
            const currPoint = points[currIdx];
            const next1Point = points[next1Idx];
            const next2Point = points[next2Idx];

            prevPositionData.push(prevPoint.x, prevPoint.y, prevPoint.z);
            positionData.push(currPoint.x, currPoint.y, currPoint.z);
            nextPositionData.push(prevPoint.x, prevPoint.y, prevPoint.z);
            
            prevPositionData.push(prevPoint.x, prevPoint.y, prevPoint.z);
            positionData.push(currPoint.x, currPoint.y, currPoint.z);
            nextPositionData.push(prevPoint.x, prevPoint.y, prevPoint.z);

            prevPositionData.push(prevPoint.x, prevPoint.y, prevPoint.z);
            positionData.push(currPoint.x, currPoint.y, currPoint.z);
            nextPositionData.push(next1Point.x, next1Point.y, next1Point.z);

            prevPositionData.push(prevPoint.x, prevPoint.y, prevPoint.z);
            positionData.push(currPoint.x, currPoint.y, currPoint.z);
            nextPositionData.push(next1Point.x, next1Point.y, next1Point.z);

            indexData.push(0);
            indexData.push(1);
            indexData.push(2);
            indexData.push(3);

            dUV.push(-0.5, -0.5);
            dUV.push(-0.5, 0.5);
            dUV.push(0.5, -0.5);
            dUV.push(0.5, 0.5);

            texCoordData.push(0.0, 0.0);
            texCoordData.push(0.0, 1.0);
            texCoordData.push(1.0, 0.0);
            texCoordData.push(1.0, 1.0);

            // 1--3
            // |  |
            // 0--2

            const indexOffset = i * 4;
            indices.push(indexOffset + 0, indexOffset + 2, indexOffset + 1);
            indices.push(indexOffset + 3, indexOffset + 1, indexOffset + 2);
          } 
          
          var g = new THREE.BufferGeometry();
          g.setIndex(indices);
          g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positionData), 3));
          g.setAttribute('prevPosition', new THREE.BufferAttribute(new Float32Array(prevPositionData), 3));
          g.setAttribute('nextPosition', new THREE.BufferAttribute(new Float32Array(nextPositionData), 3));
          g.setAttribute('index', new THREE.BufferAttribute(new Int32Array(indexData), 1));
          g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(texCoordData), 2));
          g.setAttribute('dudv', new THREE.BufferAttribute(new Float32Array(dUV), 2));

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

            const texCoord = new Float32Array([
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
            transparent: true,
        });

        return material;
    }
}