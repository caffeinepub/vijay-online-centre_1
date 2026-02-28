import React from "react";
import { Check } from "lucide-react";

interface ProgressTrackerProps {
  currentStage: number; // 0-4
}

const STAGES = [
  { label: "Submitted", desc: "Request received" },
  { label: "Docs Verified", desc: "Documents reviewed" },
  { label: "Payment Confirmed", desc: "Payment verified" },
  { label: "In Progress", desc: "Work underway" },
  { label: "Completed ✅", desc: "Service delivered" },
];

export default function ProgressTracker({ currentStage }: ProgressTrackerProps) {
  return (
    <div className="w-full">
      {/* Desktop: Horizontal */}
      <div className="hidden sm:block">
        <div className="flex items-center">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentStage;
            const isActive = index === currentStage;
            const isFuture = index > currentStage;

            return (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                      isCompleted
                        ? "border-transparent text-white"
                        : isActive
                        ? "border-transparent text-white shadow-lg scale-110"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                    style={
                      isCompleted
                        ? { backgroundColor: "#0a2463" }
                        : isActive
                        ? { backgroundColor: "#1a3a7a" }
                        : {}
                    }
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center px-1">
                    <p
                      className={`text-xs font-semibold leading-tight ${
                        isCompleted || isActive ? "text-navy" : "text-gray-400"
                      }`}
                      style={isCompleted || isActive ? { color: "#0a2463" } : {}}
                    >
                      {stage.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isFuture ? "text-gray-300" : "text-gray-500"}`}>
                      {stage.desc}
                    </p>
                  </div>
                </div>
                {index < STAGES.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 transition-all ${
                      index < currentStage ? "" : "bg-gray-200"
                    }`}
                    style={index < currentStage ? { backgroundColor: "#0a2463" } : {}}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile: Vertical */}
      <div className="sm:hidden space-y-3">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStage;
          const isActive = index === currentStage;
          const isFuture = index > currentStage;

          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 flex-shrink-0 ${
                    isCompleted
                      ? "border-transparent text-white"
                      : isActive
                      ? "border-transparent text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                  style={
                    isCompleted
                      ? { backgroundColor: "#0a2463" }
                      : isActive
                      ? { backgroundColor: "#1a3a7a" }
                      : {}
                  }
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
                </div>
                {index < STAGES.length - 1 && (
                  <div
                    className={`w-0.5 h-6 mt-1 ${index < currentStage ? "" : "bg-gray-200"}`}
                    style={index < currentStage ? { backgroundColor: "#0a2463" } : {}}
                  />
                )}
              </div>
              <div className="pt-1">
                <p
                  className={`text-sm font-semibold ${
                    isFuture ? "text-gray-400" : ""
                  }`}
                  style={!isFuture ? { color: "#0a2463" } : {}}
                >
                  {stage.label}
                </p>
                <p className={`text-xs ${isFuture ? "text-gray-300" : "text-gray-500"}`}>
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
