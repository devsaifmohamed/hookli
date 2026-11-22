import type { ComponentType } from "react";
import { UseAsyncDocDemo } from "./use-async-demo";
import { UseBatteryDocDemo } from "./use-battery-demo";
import { UseBooleanDocDemo } from "./use-boolean-demo";
import { UseClickAnyWhereDocDemo } from "./use-click-any-where-demo";
import { UseClickOutsideDocDemo } from "./use-click-outside-demo";
import { UseCopyToClipboardDocDemo } from "./use-copy-to-clipboard-demo";
import { UseCountdownDocDemo } from "./use-countdown-demo";
import { UseCounterDocDemo } from "./use-counter-demo";
import { UseDarkModeDocDemo } from "./use-dark-mode-demo";
import { UseDebounceDocDemo } from "./use-debounce-demo";
import { UseDebounceCallbackDocDemo } from "./use-debounce-callback-demo";
import { UseDebounceValueDocDemo } from "./use-debounce-value-demo";
import { UseDeepCompareEffectDocDemo } from "./use-deep-compare-effect-demo";
import { UseDefaultValueDocDemo } from "./use-default-value-demo";
import { UseDocumentTitleDocDemo } from "./use-document-title-demo";
import { UseDraggableDocDemo } from "./use-draggable-demo";
import { UseEffectOnceDocDemo } from "./use-effect-once-demo";
import { UseEventCallbackDocDemo } from "./use-event-callback-demo";
import { UseEventListenerDocDemo } from "./use-event-listener-demo";
import { UseExpandableTextDocDemo } from "./use-expandable-text-demo";
import { UseFetchDocDemo } from "./use-fetch-demo";
import { UseFormDocDemo } from "./use-form-demo";
import { UseFullscreenDocDemo } from "./use-fullscreen-demo";
import { UseGeoLocationDocDemo } from "./use-geo-location-demo";
import { UseHotkeysDocDemo } from "./use-hotkeys-demo";
import { UseHoverDocDemo } from "./use-hover-demo";
import { UseIdleDocDemo } from "./use-idle-demo";
import { UseInfiniteScrollDocDemo } from "./use-infinite-scroll-demo";
import { UseIntersectionObserverDocDemo } from "./use-intersection-observer-demo";
import { UseIntervalDocDemo } from "./use-interval-demo";
import { UseIsClientDocDemo } from "./use-is-client-demo";
import { UseIsMountedDocDemo } from "./use-is-mounted-demo";
import { UseIsomorphicLayoutEffectDocDemo } from "./use-isomorphic-layout-effect-demo";
import { UseKeyPressDocDemo } from "./use-key-press-demo";
import { UseListDocDemo } from "./use-list-demo";
import { UseLocalStorageDocDemo } from "./use-local-storage-demo";
import { UseLocalStorageWithExpiryDocDemo } from "./use-local-storage-with-expiry-demo";
import { UseLongPressDocDemo } from "./use-long-press-demo";
import { UseMapDocDemo } from "./use-map-demo";
import { UseMediaQueryDocDemo } from "./use-media-query-demo";
import { UseMousePositionDocDemo } from "./use-mouse-position-demo";
import { UseMutationDocDemo } from "./use-mutation-demo";
import { UseNetworkStateDocDemo } from "./use-network-state-demo";
import { UsePageVisibilityDocDemo } from "./use-page-visibility-demo";
import { UsePaginationDocDemo } from "./use-pagination-demo";
import { UsePermissionDocDemo } from "./use-permission-demo";
import { UsePreviousDocDemo } from "./use-previous-demo";
import { UseQueueDocDemo } from "./use-queue-demo";
import { UseRafStateDocDemo } from "./use-raf-state-demo";
import { UseReadLocalStorageDocDemo } from "./use-read-local-storage-demo";
import { UseResizeObserverDocDemo } from "./use-resize-observer-demo";
import { UseScreenDocDemo } from "./use-screen-demo";
import { UseScriptDocDemo } from "./use-script-demo";
import { UseScrollLockDocDemo } from "./use-scroll-lock-demo";
import { UseSessionStorageDocDemo } from "./use-session-storage-demo";
import { UseSetDocDemo } from "./use-set-demo";
import { UseStepDocDemo } from "./use-step-demo";
import { UseTernaryDarkModeDocDemo } from "./use-ternary-dark-mode-demo";
import { UseTextSelectionDocDemo } from "./use-text-selection-demo";
import { UseThrottleDocDemo } from "./use-throttle-demo";
import { UseTimeoutDocDemo } from "./use-timeout-demo";
import { UseToggleDocDemo } from "./use-toggle-demo";
import { UseUnmountDocDemo } from "./use-unmount-demo";
import { UseUpdateEffectDocDemo } from "./use-update-effect-demo";
import { UseWindowScrollDocDemo } from "./use-window-scroll-demo";
import { UseWindowSizeDocDemo } from "./use-window-size-demo";

/* The live demo on each hook page, by slug. Every hook has exactly one; check-playgrounds
   fails when these keys and the catalog's hooks differ. */
export const DEMOS: Record<string, ComponentType> = {
  "use-async": UseAsyncDocDemo,
  "use-battery": UseBatteryDocDemo,
  "use-boolean": UseBooleanDocDemo,
  "use-click-any-where": UseClickAnyWhereDocDemo,
  "use-click-outside": UseClickOutsideDocDemo,
  "use-copy-to-clipboard": UseCopyToClipboardDocDemo,
  "use-countdown": UseCountdownDocDemo,
  "use-counter": UseCounterDocDemo,
  "use-dark-mode": UseDarkModeDocDemo,
  "use-debounce": UseDebounceDocDemo,
  "use-debounce-callback": UseDebounceCallbackDocDemo,
  "use-debounce-value": UseDebounceValueDocDemo,
  "use-deep-compare-effect": UseDeepCompareEffectDocDemo,
  "use-default-value": UseDefaultValueDocDemo,
  "use-document-title": UseDocumentTitleDocDemo,
  "use-draggable": UseDraggableDocDemo,
  "use-effect-once": UseEffectOnceDocDemo,
  "use-event-callback": UseEventCallbackDocDemo,
  "use-event-listener": UseEventListenerDocDemo,
  "use-expandable-text": UseExpandableTextDocDemo,
  "use-fetch": UseFetchDocDemo,
  "use-form": UseFormDocDemo,
  "use-fullscreen": UseFullscreenDocDemo,
  "use-geo-location": UseGeoLocationDocDemo,
  "use-hotkeys": UseHotkeysDocDemo,
  "use-hover": UseHoverDocDemo,
  "use-idle": UseIdleDocDemo,
  "use-infinite-scroll": UseInfiniteScrollDocDemo,
  "use-intersection-observer": UseIntersectionObserverDocDemo,
  "use-interval": UseIntervalDocDemo,
  "use-is-client": UseIsClientDocDemo,
  "use-is-mounted": UseIsMountedDocDemo,
  "use-isomorphic-layout-effect": UseIsomorphicLayoutEffectDocDemo,
  "use-key-press": UseKeyPressDocDemo,
  "use-list": UseListDocDemo,
  "use-local-storage": UseLocalStorageDocDemo,
  "use-local-storage-with-expiry": UseLocalStorageWithExpiryDocDemo,
  "use-long-press": UseLongPressDocDemo,
  "use-map": UseMapDocDemo,
  "use-media-query": UseMediaQueryDocDemo,
  "use-mouse-position": UseMousePositionDocDemo,
  "use-mutation": UseMutationDocDemo,
  "use-network-state": UseNetworkStateDocDemo,
  "use-page-visibility": UsePageVisibilityDocDemo,
  "use-pagination": UsePaginationDocDemo,
  "use-permission": UsePermissionDocDemo,
  "use-previous": UsePreviousDocDemo,
  "use-queue": UseQueueDocDemo,
  "use-raf-state": UseRafStateDocDemo,
  "use-read-local-storage": UseReadLocalStorageDocDemo,
  "use-resize-observer": UseResizeObserverDocDemo,
  "use-screen": UseScreenDocDemo,
  "use-script": UseScriptDocDemo,
  "use-scroll-lock": UseScrollLockDocDemo,
  "use-session-storage": UseSessionStorageDocDemo,
  "use-set": UseSetDocDemo,
  "use-step": UseStepDocDemo,
  "use-ternary-dark-mode": UseTernaryDarkModeDocDemo,
  "use-text-selection": UseTextSelectionDocDemo,
  "use-throttle": UseThrottleDocDemo,
  "use-timeout": UseTimeoutDocDemo,
  "use-toggle": UseToggleDocDemo,
  "use-unmount": UseUnmountDocDemo,
  "use-update-effect": UseUpdateEffectDocDemo,
  "use-window-scroll": UseWindowScrollDocDemo,
  "use-window-size": UseWindowSizeDocDemo,
};
