import { useState, useEffect, useCallback } from 'react';
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

  const handlePointerEvent = useCallback((e: PointerEvent) => {
    // Standardize pointerType
    const pType = (e.pointerType as 'mouse' | 'pen' | 'touch') || 'mouse';
    const rawPressure = e.pressure;

    // Detect if device is actively reporting pressure beyond default 0.5 / 0
    const hasPressure = (rawPressure > 0 && rawPressure !== 0.5 && rawPressure !== 0) || pType === 'pen';

    setTelemetry((prev) => ({
      pointerType: pType,
      pressure: rawPressure,
      tiltX: e.tiltX || 0,
      tiltY: e.tiltY || 0,
      hasPressureSupport: prev.hasPressureSupport || hasPressure,
      isDrawing: e.buttons > 0,
      lastActiveTime: Date.now(),
      sampleCount: prev.sampleCount + 1,
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerEvent, { passive: true });
    window.addEventListener('pointermove', handlePointerEvent, { passive: true });
    window.addEventListener('pointerup', handlePointerEvent, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerEvent);
      window.removeEventListener('pointermove', handlePointerEvent);
      window.removeEventListener('pointerup', handlePointerEvent);
    };
  }, [handlePointerEvent]);

  return telemetry;
}
