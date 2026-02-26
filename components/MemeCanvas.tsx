"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const TEMPLATES = [
  { name: "Drake", img: "/templates/drake.jpg" },
  { name: "Distracted BF", img: "/templates/distracted-bf.jpg" },
  { name: "Two Buttons", img: "/templates/two-buttons.jpg" },
  { name: "Expanding Brain", img: "/templates/expanding-brain.jpg" },
  { name: "This Is Fine", img: "/templates/this-is-fine.jpg" },
  { name: "Change My Mind", img: "/templates/change-my-mind.jpg" },
  { name: "Surprised Pikachu", img: "/templates/surprised-pikachu.jpg" },
  { name: "One Does Not", img: "/templates/one-does-not.jpg" },
  { name: "Success Kid", img: "/templates/success-kid.jpg" },
  { name: "Woman Yelling", img: "/templates/woman-yelling-cat.jpg" },
  { name: "Hide Pain Harold", img: "/templates/hide-pain-harold.jpg" },
];

const MAX_CANVAS_W = 800;

type Label = {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  align: "left" | "center" | "right";
};

type MemeCanvasProps = {
  onShare?: (getBlob: () => Promise<Blob | null>) => void;
};

export function MemeCanvas({ onShare }: MemeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [nextLabelId, setNextLabelId] = useState(0);
  const [activeLabelId, setActiveLabelId] = useState<number | null>(null);
  const [dragging, setDragging] = useState<{
    labelId: number;
    ox: number;
    oy: number;
  } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const labelsRef = useRef<Label[]>([]);
  const activeLabelIdRef = useRef<number | null>(null);

  labelsRef.current = labels;
  activeLabelIdRef.current = activeLabelId;

  const addLabel = useCallback(
    (text: string, relX: number, relY: number) => {
      const label: Label = {
        id: nextLabelId,
        text: text ?? "TEXT",
        x: canvasSize.w * (relX ?? 0.5),
        y: canvasSize.h * (relY ?? 0.5),
        fontSize: 48,
        align: "center",
      };
      setLabels((prev) => [...prev, label]);
      setNextLabelId((n) => n + 1);
      return label;
    },
    [nextLabelId, canvasSize]
  );

  const resizeCanvas = useCallback((w: number, h: number) => {
    const scale = Math.min(1, MAX_CANVAS_W / w);
    const newW = Math.round(w * scale);
    const newH = Math.round(h * scale);
    setCanvasSize({ w: newW, h: newH });
    setLabels((prev) => {
      const next = [...prev];
      if (next[0]) {
        next[0].x = newW * 0.5;
        next[0].y = newH * 0.08;
      }
      if (next[1]) {
        next[1].x = newW * 0.5;
        next[1].y = newH * 0.92;
      }
      for (let i = 2; i < next.length; i++) {
        next[i].x = newW * 0.5;
        next[i].y = newH * 0.5;
      }
      return next;
    });
  }, []);

  const resetLabelPositions = useCallback(() => {
    setLabels((prev) => {
      const next = [...prev];
      const { w, h } = canvasSize;
      if (next[0]) {
        next[0].x = w * 0.5;
        next[0].y = h * 0.08;
      }
      if (next[1]) {
        next[1].x = w * 0.5;
        next[1].y = h * 0.92;
      }
      for (let i = 2; i < next.length; i++) {
        next[i].x = w * 0.5;
        next[i].y = h * 0.5;
      }
      return next;
    });
  }, [canvasSize]);

  const selectTemplate = useCallback(
    (index: number) => {
      const img = new Image();
      img.onload = () => {
        setCurrentImage(img);
        resizeCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height);
      };
      img.src = TEMPLATES[index].img;
    },
    [resizeCanvas]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          setCurrentImage(img);
          resizeCanvas(img.naturalWidth, img.naturalHeight);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [resizeCanvas]
  );

  useEffect(() => {
    if (labels.length === 0) {
      const w = 800;
      const h = 600;
      setLabels([
        {
          id: 0,
          text: "TOP TEXT",
          x: w * 0.5,
          y: h * 0.08,
          fontSize: 48,
          align: "center",
        },
        {
          id: 1,
          text: "BOTTOM TEXT",
          x: w * 0.5,
          y: h * 0.92,
          fontSize: 48,
          align: "center",
        },
      ]);
      setNextLabelId(2);
      setActiveLabelId(0);
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lbls = labelsRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentImage) {
      ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    lbls.forEach((label) => {
      if (!label.text) return;
      const fs = label.fontSize;
      const lineHeight = fs * 1.25;
      const lines = label.text.split("\n");
      const totalH = lines.length * lineHeight;

      ctx.save();
      ctx.font = `bold ${fs}px Impact, "Arial Black", sans-serif`;
      ctx.textAlign = label.align;
      ctx.textBaseline = "middle";

      const lw = Math.max(1, fs / 7);
      ctx.lineWidth = lw * 2;
      ctx.lineJoin = "round";

      lines.forEach((line, i) => {
        const y =
          label.y - totalH / 2 + i * lineHeight + lineHeight / 2;
        ctx.strokeStyle = "black";
        ctx.strokeText(line, label.x, y);
        ctx.fillStyle = "white";
        ctx.fillText(line, label.x, y);
      });

      ctx.restore();
    });
  }, [currentImage]);

  useEffect(() => {
    draw();
  }, [draw, labels, canvasSize]);

  const hitTest = useCallback(
    (label: Label, px: number, py: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !label.text) return false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;

      ctx.font = `bold ${label.fontSize}px Impact, "Arial Black", sans-serif`;
      const lines = label.text.split("\n");
      const lineHeight = label.fontSize * 1.25;
      const totalH = lines.length * lineHeight;
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const pad = 10;
      let x0: number;
      if (label.align === "center") x0 = label.x - w / 2;
      else if (label.align === "right") x0 = label.x - w;
      else x0 = label.x;
      const y0 = label.y - totalH / 2;
      return (
        px >= x0 - pad &&
        px <= x0 + w + pad &&
        py >= y0 - pad &&
        py <= y0 + totalH + pad
      );
    },
    []
  );

  const canvasPos = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const r = canvas.getBoundingClientRect();
      return {
        x: (clientX - r.left) * (canvas.width / r.width),
        y: (clientY - r.top) * (canvas.height / r.height),
      };
    },
    []
  );

  const onPointerDown = useCallback(
    (e: React.MouseEvent) => {
      const pos = canvasPos(e.clientX, e.clientY);
      const lbls = labelsRef.current;
      for (let i = lbls.length - 1; i >= 0; i--) {
        if (hitTest(lbls[i], pos.x, pos.y)) {
          setDragging({
            labelId: lbls[i].id,
            ox: pos.x - lbls[i].x,
            oy: pos.y - lbls[i].y,
          });
          setActiveLabelId(lbls[i].id);
          return;
        }
      }
    },
    [canvasPos, hitTest]
  );

  const onPointerMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = canvasPos(e.clientX, e.clientY);
      if (dragging) {
        setLabels((prev) =>
          prev.map((l) =>
            l.id === dragging.labelId
              ? { ...l, x: pos.x - dragging.ox, y: pos.y - dragging.oy }
              : l
          )
        );
      } else {
        const lbls = labelsRef.current;
        const over = lbls.some((l) => hitTest(l, pos.x, pos.y));
        if (canvasRef.current) {
          canvasRef.current.style.cursor = over ? "grab" : "default";
        }
      }
    },
    [canvasPos, hitTest, dragging]
  );

  const onPointerUp = useCallback(() => {
    setDragging(null);
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const pos = canvasPos(e.touches[0].clientX, e.touches[0].clientY);
      const lbls = labelsRef.current;
      for (let i = lbls.length - 1; i >= 0; i--) {
        if (hitTest(lbls[i], pos.x, pos.y)) {
          setDragging({
            labelId: lbls[i].id,
            ox: pos.x - lbls[i].x,
            oy: pos.y - lbls[i].y,
          });
          setActiveLabelId(lbls[i].id);
          return;
        }
      }
    },
    [canvasPos, hitTest]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!dragging) return;
      const pos = canvasPos(e.touches[0].clientX, e.touches[0].clientY);
      setLabels((prev) =>
        prev.map((l) =>
          l.id === dragging.labelId
            ? { ...l, x: pos.x - dragging.ox, y: pos.y - dragging.oy }
            : l
        )
      );
    },
    [canvasPos, dragging]
  );

  const onTouchEnd = useCallback(() => setDragging(null), []);

  const getActiveLabel = () =>
    labels.find((l) => l.id === activeLabelId) ?? null;

  const updateActiveLabel = (updates: Partial<Label>) => {
    if (activeLabelId === null) return;
    setLabels((prev) =>
      prev.map((l) => (l.id === activeLabelId ? { ...l, ...updates } : l))
    );
  };

  const deleteActiveLabel = () => {
    if (labels.length <= 1) return;
    const filtered = labels.filter((l) => l.id !== activeLabelId);
    setLabels(filtered);
    setActiveLabelId(filtered[filtered.length - 1]?.id ?? null);
  };

  const addLabelFromButton = () => {
    const label = addLabel("NEW TEXT", 0.5, 0.5);
    setActiveLabelId(label.id);
  };

  const downloadMeme = () => {
    if (!currentImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "meme.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const getBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!currentImage || !canvasRef.current) {
        resolve(null);
        return;
      }
      canvasRef.current.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        0.75
      );
    });
  }, [currentImage]);

  const activeLabel = getActiveLabel();

  return (
    <div className="flex h-[calc(100vh-53px)] overflow-hidden">
      <aside className="flex w-[220px] min-w-[220px] flex-col overflow-hidden border-r border-border bg-surface">
        <div className="border-b border-border px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Templates
        </div>
        <button
          onClick={() => document.getElementById("fileInput")?.click()}
          className="mx-2.5 mt-2.5 w-[calc(100%-20px)] rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
        >
          Upload Image
        </button>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        <div className="px-3 pt-1 pb-1.5 text-[11px] uppercase tracking-wider text-muted">
          Classic Memes
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1.5 overflow-y-auto p-2.5">
          {TEMPLATES.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => selectTemplate(i)}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 border-transparent transition-all hover:scale-105 hover:border-accent"
            >
              <img
                src={t.img}
                alt={t.name}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-black/65 px-1 py-0.5 text-center text-[9px] font-semibold text-white">
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-[#0a0a14] p-5">
          {currentImage ? (
            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              className="max-h-full max-w-full rounded shadow-2xl touch-none"
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3.5 text-center text-muted">
              <div className="text-6xl opacity-35">🖼️</div>
              <p className="text-[15px] leading-relaxed">
                Select a template from the left
                <br />
                or upload your own image
              </p>
            </div>
          )}
        </div>

        <div className="flex max-h-[270px] flex-col gap-2.5 overflow-y-auto border-t border-border bg-surface p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {labels.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActiveLabelId(l.id)}
                className={`max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-all ${
                  l.id === activeLabelId
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface2 text-muted hover:border-accent hover:text-[#e0e0e0]"
                }`}
              >
                {l.text ? (l.text.length > 12 ? l.text.slice(0, 12) + "…" : l.text) : "(empty)"}
              </button>
            ))}
            <button
              type="button"
              onClick={addLabelFromButton}
              className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted transition-all hover:border-accent hover:text-accent"
            >
              + Add Text
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-2.5">
            <div className="min-w-[180px] flex-[2]">
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
                Text
              </label>
              <textarea
                value={activeLabel?.text ?? ""}
                onChange={(e) => updateActiveLabel({ text: e.target.value })}
                placeholder="Enter meme text…"
                className="min-h-[66px] w-full resize-none rounded-lg border border-border bg-surface2 px-2.5 py-2 text-[#e0e0e0] placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div className="min-w-[110px] flex-none">
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
                Align
              </label>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateActiveLabel({ align })}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border text-[15px] transition-all ${
                      activeLabel?.align === align
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-surface2 text-muted hover:border-accent hover:bg-accent hover:text-white"
                    }`}
                    title={align}
                  >
                    {align === "left" ? "←" : align === "center" ? "↔" : "→"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
              Font Size
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={12}
                max={120}
                value={activeLabel?.fontSize ?? 48}
                onChange={(e) =>
                  updateActiveLabel({ fontSize: parseInt(e.target.value) })
                }
                className="flex-1 accent-accent"
              />
              <span className="w-8 text-right text-xs text-muted">
                {activeLabel?.fontSize ?? 48}px
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={deleteActiveLabel}
              disabled={labels.length <= 1}
              className="rounded-lg border border-red-600 px-3.5 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:pointer-events-none disabled:opacity-35"
            >
              Delete Label
            </button>
            <span className="flex-1 text-center text-[11px] text-muted opacity-70">
              Drag text on the canvas to reposition
            </span>
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(getBlob)}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85"
              >
                Share to Community
              </button>
            )}
            <button
              type="button"
              onClick={downloadMeme}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85"
            >
              Download Meme
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
