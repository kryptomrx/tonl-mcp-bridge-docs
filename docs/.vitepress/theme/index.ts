import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {})
  },
  enhanceApp() {
    if (typeof window !== 'undefined') {
      inject()
      injectSpeedInsights()
    }
  }
}