const cache = {};

function load(src) {
  const a = new Audio(src);
  a.preload = "auto";
  cache[src] = a;
}

// preload all sounds immediately on module import
load("/click.mp3");
load("/win.mp3");
load("/lost.mp3");
load("/tye.mp3");

function play(src) {
  const a = cache[src];
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

export const sfx = {
  click: () => play("/click.mp3"),
  win:   () => play("/win.mp3"),
  lose:  () => play("/lost.mp3"),
  tie:   () => play("/tye.mp3"),
};
