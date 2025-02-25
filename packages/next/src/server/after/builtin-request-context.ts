import { createAsyncLocalStorage } from '../app-render/async-local-storage'

export function getBuiltinRequestContext():
  | BuiltinRequestContextValue
  | undefined {
  const _globalThis = globalThis as GlobalThisWithRequestContext
  const ctx =
    _globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] ??
    _globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL]
  return ctx?.get()
}

/** This should be considered unstable until `unstable_after` is stablized. */
const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for('@next/request-context')

// TODO(after): this is a temporary workaround.
// Remove this when vercel builder is updated to provide '@next/request-context'.
const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for('@vercel/request-context')

type GlobalThisWithRequestContext = typeof globalThis & {
  [NEXT_REQUEST_CONTEXT_SYMBOL]?: BuiltinRequestContext
  /** @deprecated */
  [VERCEL_REQUEST_CONTEXT_SYMBOL]?: BuiltinRequestContext
}

/** A request context provided by the platform.
 * It should be considered unstable until `unstable_after` is stablized. */
export type BuiltinRequestContext = {
  get(): BuiltinRequestContextValue | undefined
}

export type RunnableBuiltinRequestContext = BuiltinRequestContext & {
  run<T>(value: BuiltinRequestContextValue, callback: () => T): T
}

export type BuiltinRequestContextValue = {
  waitUntil?: WaitUntil
}
export type WaitUntil = (promise: Promise<any>) => void

/** "@next/request-context" has a different signature from AsyncLocalStorage,
 * matching [AsyncContext.Variable](https://github.com/tc39/proposal-async-context).
 * We don't need a full AsyncContext adapter here, just having `.get()` is enough
 */
export function createLocalRequestContext(): RunnableBuiltinRequestContext {
  const storage = createAsyncLocalStorage<BuiltinRequestContextValue>()
  return {
    get: () => storage.getStore(),
    run: (value, callback) => storage.run(value, callback),
  }
}
