
let sounds = ['low', 'mid', 'high'];

let rsound = () => sounds[Math.floor(Math.random() * sounds.length)];

let volumeMap = {
  buzzer: 0.25
};

let audioElements = {};

export default function playSound (sound = rsound()) {
  let el = audioElements[sound];
  if (!el) {
    el = audioElements[sound] = new window.Audio();
    el.preload = true;
    el.autoplay = false;
    el.volume = volumeMap[sound] || 0.5;
    el.src = `audio/${sound}.mp3`;
  }

  el.pause();
  el.currentTime = 0;
  el.play();
}
