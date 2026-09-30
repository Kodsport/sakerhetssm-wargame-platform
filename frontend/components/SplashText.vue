<template>
  <button type="button" class="splash" :style="{ '--chars': [...text].length }" @click="next">
    <span :key="text" class="splash__text">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
// The pulsing yellow splash next to the logo on Minecraft's title screen.
// Click it for another one.
const SPLASHES = [
  "roppa bara fuzzen cuhh",
  "Har du provat strings?",
  "' OR 1=1 --",
  "LGTM",
  "man kan bara dra in blockchain in i pwn kategorin - wii",
  "Mitt tredje program",
  "stack not 16-byte aligned?",
  ":skull:",
  "tea in a pot",
  "Grass touching speedrun (Minecraft Edition)",
  "Claude solve this ctf challenge, make no mistake",
  "KebabBanken The Finale",
  "Randu? Ra-aandu uuuuu 🎶 🪇",
  "num bergen",
  "Fredrik Niemelä 💪 😳 😻",
  "Det här är telia",
  "SSM{aaaaaaaaaaaaaaaaaaaaaaaa_lmao_i_hope_you_thought_your_script_was_broken_at_first_hahahaha}",
  "cross site styling, 😎",
  "watevr",
  "Alfreds lärling",
  "Tony Rickardsson vann Säkerhets-SM 1945"
];

/** Minecraft swaps the splash on a few special days, so do we. */
function special(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfYear = Math.round((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  if (month === 12 && day === 24) return "God jul!";
  if (month === 1 && day === 1) return "Gott nytt år!";
  if (month === 10 && day === 31) return "OOoooOOOoooo! Läskigt!";
  if (month === 4 && day === 1) return "Nu helt utan glitchar!";
  if (month === 3 && day === 14) return "3,14159265...";
  if (dayOfYear === 256) return "Glad programmerardag!";
  return null;
}

function random(except?: string) {
  const choices = SPLASHES.filter((s) => s !== except);
  return choices[Math.floor(Math.random() * choices.length)];
}

// Picked on the server and reused on the client so hydration matches.
const text = useState("ssm-splash", () => special(new Date()) ?? random());

function next() {
  text.value = random(text.value);
}
</script>

<style scoped>
.splash {
  all: unset;
  display: inline-block;
  cursor: pointer;
  transform: rotate(-20deg);
  animation: splash-pulse 1s infinite;
  -webkit-tap-highlight-color: transparent;
}

.splash:focus-visible {
  outline: 2px dashed #ffff00;
  outline-offset: 4px;
}

.splash__text {
  display: inline-block;
  white-space: nowrap;
  font-family: var(--ssm-font-pixel);
  /* Minecraft shrinks long splashes so they all take up about the same room. */
  font-size: clamp(16px, calc(460px / (var(--chars) + 4)), 30px);
  line-height: 1;
  color: #ffff00;
  text-shadow: calc(1em / 9) calc(1em / 9) 0 #3f3f00;
  animation: ssm-boot 0.3s steps(4, end);
}

/* scale = 1.8 - |sin(2πt)| * 0.1 as on the title screen: a sharp bounce at
   full size, a soft turn at the smallest. */
@keyframes splash-pulse {
  0%,
  50%,
  100% {
    transform: rotate(-20deg) scale(1);
    animation-timing-function: ease-out;
  }
  25%,
  75% {
    transform: rotate(-20deg) scale(0.945);
    animation-timing-function: ease-in;
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash,
  .splash__text {
    animation: none;
  }
}
</style>
