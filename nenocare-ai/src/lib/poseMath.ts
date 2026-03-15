type Point2D = { x: number; y: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function angleBetweenPoints(a: Point2D, b: Point2D, c: Point2D): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const abLen = Math.hypot(ab.x, ab.y);
  const cbLen = Math.hypot(cb.x, cb.y);

  if (abLen === 0 || cbLen === 0) {
    return 0;
  }

  const cosine = clamp(dot / (abLen * cbLen), -1, 1);
  const radians = Math.acos(cosine);

  return (radians * 180) / Math.PI;
}
