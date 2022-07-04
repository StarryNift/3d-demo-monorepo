export function reverseKeyMapping<T extends string, K extends string>(
  inputMap: Record<T, K | K[]>,
  inputKeyMapper: (inputKey: K) => K | undefined | false = inputKey => inputKey
): Partial<Record<K, T>> {
  const reversedMap: Record<K, T> = {} as any;
  for (const mappedKey in inputMap) {
    for (const inputKey of ([] as K[]).concat(inputMap[mappedKey])) {
      const actualInputKey = inputKeyMapper(inputKey);

      if (actualInputKey) {
        reversedMap[actualInputKey] = mappedKey;
      }
    }
  }
  return reversedMap;
}
