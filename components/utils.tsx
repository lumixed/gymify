
export function calculateAngle(
  A: { x: number; y: number },
  B: { x: number; y: number },
  C: { x: number; y: number }
) {
  const angleBA = Math.atan2(A.y - B.y, A.x - B.x);
  const angleBC = Math.atan2(C.y - B.y, C.x - B.x);
  
  let angle = Math.abs((angleBA - angleBC) * (180 / Math.PI));
  
  if (angle > 180) angle = 360 - angle;
  
  return angle;
}

let audioCtx: AudioContext | null = null;
export function playBeep() {
    if (typeof window === 'undefined') return;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.2);
}