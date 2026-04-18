import React from 'react';

/**
 * WidgetBoundary — a scoped error boundary for individual home-screen widgets.
 *
 * Wrapping each widget (hero, quests, badges, streak, etc.) means one
 * exploding widget renders its own fallback instead of blanking the whole
 * page. Crucial at pilot scale when edge cases will surface.
 *
 * Default fallback is a small muted placeholder — deliberately un-chromey so
 * it doesn't scream "error" at Reliance employees during the pilot. Pass a
 * custom `fallback` prop when a specific widget needs a different voice.
 *
 * Usage:
 *   <WidgetBoundary name="hero">
 *     <VerticalHero vertical={v} heroProps={props} />
 *   </WidgetBoundary>
 */
export default class WidgetBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(`[WidgetBoundary:${this.props.name || 'anonymous'}]`, error, info);
    // TODO(obs): wire to Sentry via @sentry/react once pilot starts
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          padding: '12px 16px',
          margin: '0 16px',
          background: 'var(--color-bg-sunken, #f5f5f5)',
          border: '1px solid var(--color-border-subtle, #e5e5e5)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--color-text-tertiary, #888)',
          textAlign: 'center',
        }}>
          Couldn’t load this section. Pull to refresh.
        </div>
      );
    }
    return this.props.children;
  }
}
