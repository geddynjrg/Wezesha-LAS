'use client';

import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { type FC, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  defaultSignature?: string | null;
  onChange?: (dataUrl: string | null) => void;
  className?: string;
}

export const SignaturePad: FC<SignaturePadProps> = ({
  defaultSignature,
  onChange,
  className,
}) => {
  const canvasRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const savedData = canvas.isEmpty() ? defaultSignature : canvas.toDataURL('image/png');
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = container.clientWidth;
      const height = Math.max(Math.round(width * 0.45), 180);

      canvas.getCanvas().width = width * ratio;
      canvas.getCanvas().height = height * ratio;
      canvas.getCanvas().style.width = `${width}px`;
      canvas.getCanvas().style.height = `${height}px`;
      canvas.getCanvas().getContext('2d')?.scale(ratio, ratio);
      canvas.clear();

      if (savedData) {
        canvas.fromDataURL(savedData);
        onChangeRef.current?.(savedData);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [defaultSignature]);

  const handleClear = () => {
    canvasRef.current?.clear();
    onChangeRef.current?.(null);
  };

  const handleEnd = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.isEmpty()) {
      onChangeRef.current?.(null);
      return;
    }

    onChangeRef.current?.(canvas.toDataURL('image/png'));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-neutral-300 bg-white"
      >
        <SignatureCanvas
          ref={canvasRef}
          penColor="#111827"
          minWidth={1.5}
          maxWidth={3}
          onEnd={handleEnd}
          canvasProps={{
            className: 'block w-full touch-none select-none',
            style: { touchAction: 'none' },
          }}
        />
      </div>

      <div className="flex justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={handleClear}>
          Clear signature
        </Button>
      </div>
    </div>
  );
};
