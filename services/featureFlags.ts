const env = (import.meta as any).env || {};

const asBool = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return fallback;
};

export const featureFlags = {
  // Gates next-level DIY orchestration features until rollout is ready.
  nextLevelDIY: asBool(env.VITE_ENABLE_NEXT_LEVEL_DIY, false),
  templateExperiments: asBool(env.VITE_ENABLE_TEMPLATE_EXPERIMENTS, false),
};
