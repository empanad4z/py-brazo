import { useRef, useState, useEffect } from "react";

const DrawingApp = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isErasing, setIsErasing] = useState(false);
  //@ts-ignore
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const maxUndo = 12;

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const sizeRef = useRef<HTMLDivElement | null>(null);
  const [showInput, setShowInput] = useState(false);

   // Setup canvas size to fill container (responsive)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      // Preserve current drawing by snapshot -> draw onto resized canvas
      const prev = canvas.toDataURL();

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${Math.floor(rect.width)}px`;
      canvas.style.height = `${Math.floor(rect.height)}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);

      // restore
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
      };
      img.src = prev;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // reset transform in case it's been scaled
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setIsDrawing(true);

    // save snapshot for undo
    pushUndo();

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastPoint.current = { x, y };

    const ctx = getCtx();
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas || !lastPoint.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = getCtx();
    if (!ctx) return;

    // brush settings
    ctx.lineWidth = size;
    if (isErasing) {
      ctx.globalCompositeOperation = "destination-out"; // eraser
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPoint.current = { x, y };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch {}
    setIsDrawing(false);
    lastPoint.current = null;
  }

  // Undo stack helpers (store data URLs)
  const pushUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL();
    setUndoStack((s) => {
      const next = [url, ...s].slice(0, maxUndo);
      return next;
    });
  };

  //@ts-ignore
  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUndoStack((s) => {
      if (s.length === 0) return s;
      const [top, ...rest] = s;
      const img = new Image();
      img.onload = () => {
        const ctx = getCtx();
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
      };
      img.src = top;
      return rest;
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    pushUndo();
    const ctx = getCtx();
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }

  // Quick preset: draw a faint grid or background if wanted (optional)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    if (!ctx) return;
    // leave transparent by default; uncomment to add white background
    // ctx.fillStyle = '#ffffff';
    // ctx.fillRect(0,0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
  const handleClickOutside = (e: Event) => {
    if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) {
      setShowInput(false);
    }
  };

  document.addEventListener('pointerdown', handleClickOutside);

  return () => {
    document.removeEventListener('pointerdown', handleClickOutside);
  };
}, []);




  return (
    <div className="w-full h-[85vh] max-h-[900px] flex flex-col gap-4">
        <div ref={containerRef} className="flex-1 border rounded-md overflow-hidden bg-white">
            {/* Canvas */}
            <canvas
            ref={canvasRef}
            className="w-full h-full touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onContextMenu={(e) => e.preventDefault()}
            />
        </div>

        {/* Toolbar */}
        <div className="relative inline-flex flex-wrap gap-2 bg-gray-200 p-3 rounded-lg mx-auto">
          {showInput && (
            <div
              ref={sizeRef}
              className="absolute -top-16 left-1/2 -translate-x-1/2
                        bg-white border border-gray-300 rounded-lg shadow-lg
                        px-3 py-2"
            >
              <input
                type="range"
                min="1"
                max="20"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-32"
              />
            </div>
          )}
        
          {/* Brush (not 100% functional yet) */}
          <button
          className="p-2 bg-white rounded shadow"
          onClick={() => setIsErasing(false)}
          >
          🖌️
          </button>
          {/* Eraser */}
          <button
          className="p-2 bg-white rounded shadow"
          onClick={() => setIsErasing(true)}
          >
          🧽
          </button>
          {/* Color Picker */}  
          <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 p-0 border-0 rounded"
          />
          {/* Brush size slider */}
            
          <button
            className="p-2 bg-white rounded shadow"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setShowInput(!showInput)}
          >
            Size
          </button>
          
          {/* Clear button */}
          <button className="p-2 bg-red-500 text-white rounded" onClick={clearCanvas}>
          🗑️
          </button>
          {/* Confirm button */}
          <button className="p-2 bg-green-500 text-white rounded">✔️</button>
        </div>
    </div>
  );
};

export default DrawingApp;
