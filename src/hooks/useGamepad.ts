import { useEffect, useRef } from 'react';

interface GamepadCallbacks {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onA?: () => void;
  onB?: () => void;
  onStart?: () => void;
}

export const useGamepad = (callbacks: GamepadCallbacks, active: boolean = true) => {
  const requestRef = useRef<number | null>(null);
  const cooldowns = useRef<Record<string, number>>({});

  const COOLDOWN_MS = 220; // Cooldown to prevent repeat fires on single press

  const checkGamepad = () => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0] || gamepads.find(g => g !== null);

    if (gp) {
      const now = Date.now();
      
      const trigger = (key: string, callback?: () => void) => {
        const lastFire = cooldowns.current[key] || 0;
        if (now - lastFire > COOLDOWN_MS) {
          if (callback) callback();
          cooldowns.current[key] = now;
        }
      };

      // 1. D-Pad & Left Stick navigation
      const stickThreshold = 0.5;
      const upPressed = gp.buttons[12]?.pressed || gp.axes[1] < -stickThreshold;
      const downPressed = gp.buttons[13]?.pressed || gp.axes[1] > stickThreshold;
      const leftPressed = gp.buttons[14]?.pressed || gp.axes[0] < -stickThreshold;
      const rightPressed = gp.buttons[15]?.pressed || gp.axes[0] > stickThreshold;

      if (upPressed) trigger('up', callbacks.onUp);
      if (downPressed) trigger('down', callbacks.onDown);
      if (leftPressed) trigger('left', callbacks.onLeft);
      if (rightPressed) trigger('right', callbacks.onRight);

      // 2. Action buttons
      // Standard Mapping: Button 0 = A (Bottom button), Button 1 = B (Right button), Button 9 = Start
      const aPressed = gp.buttons[0]?.pressed;
      const bPressed = gp.buttons[1]?.pressed;
      const startPressed = gp.buttons[9]?.pressed;

      if (aPressed) trigger('a', callbacks.onA);
      if (bPressed) trigger('b', callbacks.onB);
      if (startPressed) trigger('start', callbacks.onStart);
    }

    if (active) {
      requestRef.current = requestAnimationFrame(checkGamepad);
    }
  };

  useEffect(() => {
    if (active) {
      requestRef.current = requestAnimationFrame(checkGamepad);
    }
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callbacks, active]);
};
export default useGamepad;
