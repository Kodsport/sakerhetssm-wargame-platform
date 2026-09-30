export default defineNuxtPlugin(() => {

  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  const recent: string[] = [];
  let entered = 0;

  window.addEventListener("keydown", (event) => {
    recent.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    if (recent.length > code.length) recent.shift();
    if (recent.join() !== code.join()) return;
    recent.length = 0;

    // Anyone who enters it twice gets sent somewhere else instead.
    if (++entered > 1) {
      window.location.href = "https://alanoo.dev/writeups/snht-2026-quals/video.webm";
      return;
    }

    const root = document.documentElement;
    root.classList.remove("ssm-glitch-storm");
    void root.offsetWidth; // restart the animation if it is already running
    root.classList.add("ssm-glitch-storm");
    setTimeout(() => root.classList.remove("ssm-glitch-storm"), 2000);
  });
});
