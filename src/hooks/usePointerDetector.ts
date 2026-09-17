import { useState, useEffect, useRef } from 'react';
import { PointerTelemetry } from '../types/whiteboard';

export function usePointerDetector() {
  const [telemetry, setTelemetry] = useState<PointerTelemetry>({
    pointerType: 'mouse',
    pressure: 0,
    tiltX: 0,
    tiltY: 0,
    hasPressureSupport: false,
    isDrawing: false,
    lastActiveTime: Date.now(),
    sampleCount: 0,
  });

  const lastUpdateRef = useRef<number>(0);
  const currentTelemetryRef = useRef<PointerTelemetry>(telemetry);

  useEffect(() => {
    const handlePointerEvent = (e: PointerEvent) => {
      const pType = (e.pointerType as 'mouse' | 'pen' | 'touch') || 'mouse';
      const rawPressure = e.pressure;
      const hasPressure = (rawPressure > 0 && rawPressure !== 0.5) || pType === 'pen';

      const current = currentTelemetryRef.current;
      const now = Date.now();

      // Only re-render React state if pointer type changes, pressure support is newly detected,
      // or at most once every 300ms during active drawing to update the badge
      const typeChanged = current.pointerType !== pType;
      const pressureSupportChanged = !current.hasPressureSupport && hasPressure;
      const throttledTimeElapsed = now - lastUpdateRef.current > 300;

      if (typeChanged || pressureSupportChanged || (e.type !== 'pointermove' && throttledTimeElapsed)) {
        lastUpdateRef.current = now;
        const updated: PointerTelemetry = {
          pointerType: pType,
          pressure: rawPressure,
          tiltX: e.tiltX || 0,
          tiltY: e.tiltY || 0,
          hasPressureSupport: current.hasPressureSupport || hasPressure,
          isDrawing: e.buttons > 0,
          lastActiveTime: now,
          sampleCount: current.sampleCount + 1,
        };
        currentTelemetryRef.current = updated;
        setTelemetry(updated);
      }
    };

    window.addEventListener('pointerdown', handlePointerEvent, { passive: true });
    window.addEventListener('pointermove', handlePointerEvent, { passive: true });
    window.addEventListener('pointerup', handlePointerEvent, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerEvent);
      window.removeEventListener('pointermove', handlePointerEvent);
      window.removeEventListener('pointerup', handlePointerEvent);
    };
  }, []);

  return telemetry;
}

