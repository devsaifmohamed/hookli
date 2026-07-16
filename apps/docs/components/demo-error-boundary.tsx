"use client";

import { Component, type ReactNode } from "react";

/* Class component on purpose — error boundaries have no hook equivalent.
   Wraps every hook-page demo so a crashing demo never kills the page
   (docs/DESIGN.md §5). */
export class DemoErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-fg">This demo crashed.</p>
          <p className="text-sm text-gray-body">
            The rest of the page is unaffected.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="min-h-11 rounded-md border border-slate-syntax/40 px-4 text-sm text-fg transition-colors duration-200 hover:border-slate-syntax"
          >
            Re-run demo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
