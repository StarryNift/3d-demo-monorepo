import { useEffect } from 'react';
import type { ProxyEvent } from './events/event-handler-store';
import { useEventHandlerStore } from './events/event-handler-store';
import { FBXModel, GLTFModel } from './model';
import { ManifestJson } from './types/manifest';

export interface SceneProps {
  sceneId: number;
  manifest: ManifestJson;
  debug?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  handlers?: Record<string, (event: ProxyEvent) => void>;
}

export function DynamicScene({
  sceneId,
  manifest,
  castShadow,
  receiveShadow,
  handlers = {},
  debug = false
}: SceneProps) {
  console.log('render scene', sceneId, manifest);

  const setHandlers = useEventHandlerStore(state => state.setHandlers);

  useEffect(() => {
    setHandlers(handlers);
  }, [handlers]);

  return (
    <>
      {manifest.models.map(model => {
        if (model.name.endsWith('fbx')) {
          return (
            <FBXModel
              key={model.name}
              castShadow={castShadow}
              receiveShadow={receiveShadow}
              debug={debug}
              manifest={model}
            />
          );
        } else {
          return (
            <GLTFModel
              key={model.name}
              castShadow={castShadow}
              receiveShadow={receiveShadow}
              debug={debug}
              manifest={model}
            />
          );
        }
      })}
    </>
  );
}

export type { ManifestJson };
