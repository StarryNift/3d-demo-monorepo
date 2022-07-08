import { ManifestJson } from './types/manifest';
import { Model } from './model';

export interface SceneProps {
  sceneId: number;
  manifest: ManifestJson;
  debug?: boolean;
}

export function DynamicScene({ sceneId, manifest, debug = false }: SceneProps) {
  console.log('render scene', sceneId, manifest);

  return (
    <>
      {manifest.models.map(model => (
        <Model
          key={model.name}
          castShadow
          receiveShadow
          debug={debug}
          manifest={model}
        />
      ))}
    </>
  );
}

export type { ManifestJson };
