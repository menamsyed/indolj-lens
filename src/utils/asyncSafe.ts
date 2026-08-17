// Polyfill helper for Promise.allSettled in React Native Hermes/JSC engines.
// Shared by useWidgetsData and useBranchWiseSummaries.
export async function safeAllSettled<T extends readonly unknown[] | []>(
  promises: T
): Promise<{ [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }> {
  if (typeof Promise.allSettled === 'function') {
    return Promise.allSettled(promises);
  }
  return Promise.all(
    promises.map((p) =>
      Promise.resolve(p).then(
        (value) => ({ status: 'fulfilled' as const, value }),
        (reason) => ({ status: 'rejected' as const, reason })
      )
    )
  ) as Promise<{ [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }>;
}

export default {
  safeAllSettled,
};
