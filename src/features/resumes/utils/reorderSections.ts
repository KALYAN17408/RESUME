/**
 * Reorders an array by moving an item from startIndex to endIndex
 */
export function reorderArray<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

/**
 * Moves an item in an array up by one position
 */
export function moveItemUp<T>(list: T[], index: number): T[] {
  if (index <= 0) return list;
  return reorderArray(list, index, index - 1);
}

/**
 * Moves an item in an array down by one position
 */
export function moveItemDown<T>(list: T[], index: number): T[] {
  if (index >= list.length - 1) return list;
  return reorderArray(list, index, index + 1);
}
