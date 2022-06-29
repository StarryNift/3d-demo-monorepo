/// <reference types="@welldone-software/why-did-you-render" />
import { useBox } from '@react-three/cannon';
import { useControls } from 'leva';
import useThirdPersonCameraControls from 'libs/third-person-controls/src/lib/hooks/use-third-person-camera-controls';
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      trackExtraHooks: [
        [useBox, 'useBox'],
        [useControls, 'useControls'],
        [useThirdPersonCameraControls, 'useThirdPersonCameraControls']
      ]
    });
  }
}
