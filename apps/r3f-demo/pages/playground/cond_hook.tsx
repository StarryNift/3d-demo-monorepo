import { useControls } from 'leva';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';

function useHook1(input: number): [number, Dispatch<SetStateAction<number>>] {
  const [v, setV] = useState(input);

  return [v * 1, setV];
}

function useHook2(input: number): [number, Dispatch<SetStateAction<number>>] {
  const [v, setV] = useState(input);
  // Uncomment this line will cause runtime error after change the input
  // const [B, setB] = useState();

  return [v * 2, setV];
}

function useHook3(input: number): [number, Dispatch<SetStateAction<number>>] {
  const [v, setV] = useState(input);

  return [v * 3, setV];
}

interface ComponentWithHookProps {
  condition: number;
}

export function matchCondition(
  condition: number
): [number, Dispatch<SetStateAction<number>>] {
  switch (condition) {
    case 1:
      return useHook1(2);
    case 2:
      return useHook2(2);
    case 3:
      return useHook3(2);
  }
}

export function ComponentWithHookA({
  condition,
  children
}: PropsWithChildren<ComponentWithHookProps>) {
  // This is fine, since condition was passed in from the parent component
  let [selected, updateSelected] = matchCondition(condition);

  // This is fine, since condition was passed in from the parent component
  // if (condition === 1) {
  //   useEffect(() => {
  //     console.log('hook1');
  //   }, []);
  // }

  return (
    <div>
      <p>{selected}</p>
      <button onClick={() => updateSelected(v => v + 1)}>inc</button>
      {children}
    </div>
  );
}

export function ComponentWithHookB({ children }: PropsWithChildren) {
  const values = useControls({
    /**
     * NOTE:
     * Change value of conditionB will cause panic (Unhandled Runtime Error):
     * `Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`
     */
    conditionB: {
      value: 1,
      options: [1, 2, 3]
    }
  });

  const condition = values.conditionB;

  // This is fine, since condition was passed in from the parent component
  let [selected, updateSelected] = matchCondition(condition);

  // This is fine, since condition was passed in from the parent component
  if (condition === 1) {
    useEffect(() => {
      console.log('hook1');
    }, []);
  }

  return (
    <div>
      <p>{selected}</p>
      <button onClick={() => updateSelected(v => v + 1)}>inc</button>
      {children}
    </div>
  );
}

export const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default function ConditionalHook() {
  const values = useControls({
    conditionA: {
      value: 1,
      options: [1, 2, 3]
    }
  });

  return (
    <PageContainer>
      <ComponentWithHookA condition={values.conditionA}>
        <p>Children</p>
      </ComponentWithHookA>
      <ComponentWithHookB>
        <p>Children</p>
      </ComponentWithHookB>
    </PageContainer>
  );
}
