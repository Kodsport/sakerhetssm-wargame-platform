import type { Ref } from "vue";

/** Tracks `prefers-reduced-motion`; always false during SSR. */
export function useReducedMotion() {
  const reduced = ref(false);
  let query: MediaQueryList | null = null;
  const update = () => (reduced.value = !!query?.matches);

  onMounted(() => {
    query = window.matchMedia("(prefers-reduced-motion: reduce)");
    update();
    query.addEventListener("change", update);
  });
  onBeforeUnmount(() => query?.removeEventListener("change", update));

  return reduced;
}

/** True while the element is on screen and the tab is visible. */
export function useOnScreen(el: Ref<Element | null>) {
  const onScreen = ref(false);
  const tabVisible = ref(true);
  let observer: IntersectionObserver | null = null;
  const onVisibility = () => (tabVisible.value = !document.hidden);

  onMounted(() => {
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    observer = new IntersectionObserver(([entry]) => (onScreen.value = entry.isIntersecting));
    if (el.value) observer.observe(el.value);
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
  });

  return computed(() => onScreen.value && tabVisible.value);
}

/** Calls `frame` every animation frame while `active` is true. */
export function useAnimationFrame(active: Ref<boolean>, frame: (time: number) => void) {
  let handle = 0;
  let mounted = false;
  const loop = (time: number) => {
    frame(time);
    handle = requestAnimationFrame(loop);
  };
  const sync = () => {
    cancelAnimationFrame(handle);
    handle = active.value ? requestAnimationFrame(loop) : 0;
  };

  watch(active, () => mounted && sync());
  onMounted(() => {
    mounted = true;
    sync();
  });
  onBeforeUnmount(() => {
    mounted = false;
    cancelAnimationFrame(handle);
  });
}
