/**
 * 获取 transform 中的 scale 值
 * @param transform transform 的值
 */
export function parseTransform(transform: string, name: string): number | null {
  const re = new RegExp(name + `\\((.+)\\)`);
  const result = transform.match(re);
  let value = null;
  if (result && result.length > 1) {
    value = parseFloat(result[1]);
  }
  return value;
}

/**
 * 比较元素的 transform: scale(x)，x 是否和给予的 scale 值一致
 * @param element Dom 元素
 * @param scale scale 值
 */
export function expectScale(element: HTMLElement, scale: number): void {
  const domScale = parseTransform(element.style.transform, 'scale') as number;
  expect(domScale).toBeCloseTo(scale);
}
