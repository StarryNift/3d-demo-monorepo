import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const INPUT_FILE = './assets/scene.json';
const OUTPUT_FILE = './assets/scene-output.json';

const inputText = readFileSync(resolve(process.cwd(), INPUT_FILE), {
  encoding: 'utf8'
});

const inputJson = JSON.parse(inputText.replace(/^\ufeff/g,""));

const outputJson = {
  models: inputJson.models.map(model => ({
    src: `https://d1uoymq29mtp9f.cloudfront.net/web/3D/mua_dao/${model.src}`,
    name: model.src.replace(/^models\//, ''),
    transforms: model.transforms.map(transform => ({
      position: { x: -transform.position.x, y: transform.position.y, z: transform.position.z },
      scale: transform.scale,
      quaternion: transform.rotation,
    })),
    physics: model.colliders?.map(meshName => ({
      bodyType: 'Trimesh',
      node: meshName,
      material: 'wall',
      render: false
    }))
  })),
  environment: inputJson.environment,
}

writeFileSync(resolve(process.cwd(), OUTPUT_FILE), JSON.stringify(outputJson, null, 2));