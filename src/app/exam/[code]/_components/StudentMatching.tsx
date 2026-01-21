import { cn } from "@heroui/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";

interface Pair {
  id: string;
  leftText: string;
  rightText: string;
}

interface StudentMatchingProps {
  questionId: string;
  pairs: Pair[];
  onChange: (matches: Record<string, string>) => void;
}

export function StudentMatching({
  questionId,
  pairs,
  onChange,
}: StudentMatchingProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Refs for tracking positions
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Mouse position for live drawing
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );
  // Calculated line coordinates
  const [connections, setConnections] = useState<
    Array<{
      leftId: string;
      start: { x: number; y: number };
      end: { x: number; y: number };
      color: string;
    }>
  >([]);

  const [rightItems] = useState(() => {
    return [...pairs]
      .map((p) => ({ id: p.id, text: p.rightText }))
      .sort(() => Math.random() - 0.5);
  });

  const colors = [
    "border-primary bg-primary/5 text-primary",
    "border-secondary bg-secondary/5 text-secondary",
    "border-success bg-success/5 text-success",
    "border-warning bg-warning/5 text-warning",
    "border-danger bg-danger/5 text-danger",
    "border-purple-500 bg-purple-500/5 text-purple-600",
  ];

  // Hex equivalents for SVG stroke
  const strokeColors = [
    "#006FEE", // primary
    "#7828c8", // secondary
    "#17c964", // success
    "#f5a524", // warning
    "#f31260", // danger
    "#9333ea", // purple
  ];

  const getMatchColor = (leftId: string) => {
    const index = pairs.findIndex((p) => p.id === leftId);
    return colors[index % colors.length];
  };

  const getStrokeColor = (leftId: string) => {
    const index = pairs.findIndex((p) => p.id === leftId);
    return strokeColors[index % strokeColors.length];
  };

  const handleLeftClick = (id: string) => {
    if (matches[id]) {
      const newMatches = { ...matches };
      delete newMatches[id];
      setMatches(newMatches);
      onChange(newMatches);
      return;
    }
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (rightId: string) => {
    if (!selectedLeft) return;

    const existingLeft = Object.keys(matches).find(
      (k) => matches[k] === rightId,
    );

    const newMatches = { ...matches };
    if (existingLeft) {
      delete newMatches[existingLeft];
    }

    newMatches[selectedLeft] = rightId;
    setMatches(newMatches);
    onChange(newMatches);
    setSelectedLeft(null);
  };

  // Calculate coordinates for all lines
  const updateConnections = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newConnections: typeof connections = [];

    Object.entries(matches).forEach(([leftId, rightId]) => {
      const leftEl = leftRefs.current[leftId];
      const rightEl = rightRefs.current[rightId];

      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();

        // Start point: Right edge of left item
        const start = {
          x: leftRect.right - containerRect.left,
          y: leftRect.top + leftRect.height / 2 - containerRect.top,
        };

        // End point: Left edge of right item
        const end = {
          x: rightRect.left - containerRect.left,
          y: rightRect.top + rightRect.height / 2 - containerRect.top,
        };

        newConnections.push({
          leftId,
          start,
          end,
          color: getStrokeColor(leftId),
        });
      }
    });
    setConnections(newConnections);
  }, [matches, rightItems]); // Added rightItems as dep to be safe, though static

  // Update lines on match change or resize
  useEffect(() => {
    updateConnections();
    window.addEventListener("resize", updateConnections);
    // Also use MutationObserver or plain timeout to handle layout shifts (like images loading or expanding content)
    const timeout = setTimeout(updateConnections, 100);
    return () => {
      window.removeEventListener("resize", updateConnections);
      clearTimeout(timeout);
    };
  }, [updateConnections]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectedLeft && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Logic to get live line start point
  const getLiveLineStart = () => {
    if (!selectedLeft || !containerRef.current) return null;
    const leftEl = leftRefs.current[selectedLeft];
    if (!leftEl) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const leftRect = leftEl.getBoundingClientRect();

    return {
      x: leftRect.right - containerRect.left,
      y: leftRect.top + leftRect.height / 2 - containerRect.top,
    };
  };

  const liveStart = getLiveLineStart();

  return (
    <div
      className="relative select-none"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos(null)}
    >
      {/* SVG Overlay */}
      <svg className="absolute inset-0 pointer-events-none z-10 w-full h-full overflow-visible">
        {/* Completed Connections */}
        {connections.map((conn) => {
          const dx = conn.end.x - conn.start.x;
          const controlPointOffset = dx * 0.5;
          const path = `M ${conn.start.x} ${conn.start.y} C ${conn.start.x + controlPointOffset} ${conn.start.y}, ${conn.end.x - controlPointOffset} ${conn.end.y}, ${conn.end.x} ${conn.end.y}`;

          return (
            <g key={conn.leftId}>
              <path
                d={path}
                stroke={conn.color}
                strokeWidth="3"
                fill="none"
                className="drop-shadow-sm transition-all duration-300 ease-out"
              />
              <circle
                cx={conn.start.x}
                cy={conn.start.y}
                r="4"
                fill={conn.color}
              />
              <circle cx={conn.end.x} cy={conn.end.y} r="4" fill={conn.color} />
            </g>
          );
        })}

        {/* Live Drawing Line */}
        {selectedLeft && mousePos && liveStart && (
          <path
            d={`M ${liveStart.x} ${liveStart.y} C ${liveStart.x + 50} ${liveStart.y}, ${mousePos.x - 50} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
            stroke="#d4d4d8"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="opacity-70"
          />
        )}
      </svg>

      <div className="grid grid-cols-2 gap-8 md:gap-24 relative z-0">
        {/* Left Column (Prompts) */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-default-400 uppercase mb-2 pl-1">
            Prompts
          </h4>
          {pairs.map((pair) => {
            const isMatched = !!matches[pair.id];
            const isSelected = selectedLeft === pair.id;
            const matchColor = isMatched ? getMatchColor(pair.id) : "";

            return (
              <div
                key={pair.id}
                ref={(el) => (leftRefs.current[pair.id] = el)}
                onClick={() => handleLeftClick(pair.id)}
                className={cn(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all relative group",
                  isSelected
                    ? "border-primary ring-4 ring-primary/10 bg-primary/5 shadow-md"
                    : isMatched
                      ? matchColor
                      : "border-default-200 bg-white hover:border-default-300 hover:shadow-sm",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{pair.leftText}</span>
                  {/* Connection Point Visual */}
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      isMatched || isSelected
                        ? "bg-current"
                        : "bg-default-300 group-hover:bg-default-400 opacity-0 group-hover:opacity-100",
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (Matches) */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-default-400 uppercase mb-2 text-right pr-1">
            Options
          </h4>
          {rightItems.map((item) => {
            const matchedLeftId = Object.keys(matches).find(
              (k) => matches[k] === item.id,
            );
            const matchColor = matchedLeftId
              ? getMatchColor(matchedLeftId)
              : "";

            return (
              <div
                key={item.id}
                ref={(el) => (rightRefs.current[item.id] = el)}
                onClick={() => handleRightClick(item.id)}
                className={cn(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between relative group",
                  matchedLeftId
                    ? matchColor
                    : selectedLeft
                      ? "border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary text-primary"
                      : "border-default-200 bg-white hover:border-default-300 hover:shadow-sm",
                )}
              >
                {/* Connection Point Visual (Left side) */}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all -ml-1",
                    matchedLeftId ? "bg-current" : "bg-default-300 opacity-0",
                  )}
                />

                <span className="text-sm font-semibold">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
