import { render } from '@testing-library/react';

import ThirdPersonControls from './third-person-controls';

describe('ThirdPersonControls', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ThirdPersonControls />);
    expect(baseElement).toBeTruthy();
  });
});
