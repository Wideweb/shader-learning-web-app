export class Vec3
{
  public x: number;
  public y: number;
  public z: number;

  public constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

export class GlCamera
{
  public position = new Vec3(-0.5, -0.5, 2.0);
  public rotation = new Vec3();

  public near = 0.1;
  public far = 100;

  public isOrthographic = true;

  public fov = 45;

  public left = 0;
  public right = 1;
  public top = 1;
  public bottom = 0;
}

export enum GlGeometry
{
  Triangle,
  Plane,
  Box,
  Sphere,
}

export class GlSceneObject
{
  public position = new Vec3(0.0, 0.0, 0.0);
  public rotation = new Vec3(0.0, 0.0, 0.0);
  public scale = new Vec3(1, 1, 1);
  public geometry = GlGeometry.Plane;
}

export class GlScene
{
  public camera = new GlCamera();
  public object = new GlSceneObject();

  public background = 0xFFFFFF;
}