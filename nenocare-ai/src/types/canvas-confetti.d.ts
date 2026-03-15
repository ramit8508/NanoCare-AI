declare module "canvas-confetti" {
  type Options = Record<string, unknown>;
  const confetti: (options?: Options) => Promise<undefined> | null;
  export default confetti;
}
