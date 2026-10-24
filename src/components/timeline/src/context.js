import { createContext } from '../../../utils/context'

/**
 * Provided by `AtTimeline` as `reactive({ pending, children, register, unregister })`
 * (`pending` unwrapped from `toRef`, `children` from `useChildren`).
 * `AtTimelineItem` injects it with `null` fallback and derives last/pending state from its index.
 */
export const TimelineContext = createContext('AtTimeline')
