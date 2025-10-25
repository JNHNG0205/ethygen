"use client"
import { Button } from "@/components/ui/button"
import { MousePointer2, Minus, Slash, AlignEndVertical as AlignVertical, Square, Type, Eraser } from "lucide-react"

export type ChartTool = "cursor" | "trendline" | "horizontal" | "vertical" | "rectangle" | "text" | "clear"

interface ChartToolsSidebarProps {
  activeTool: ChartTool
  onToolChange: (tool: ChartTool) => void
}

export function ChartToolsSidebar({ activeTool, onToolChange }: ChartToolsSidebarProps) {
  const tools = [
    { id: "cursor" as ChartTool, icon: MousePointer2, label: "Select / Cursor" },
    { id: "trendline" as ChartTool, icon: Slash, label: "Trendline" },
    { id: "horizontal" as ChartTool, icon: Minus, label: "Horizontal Line" },
    { id: "vertical" as ChartTool, icon: AlignVertical, label: "Vertical Line" },
    { id: "rectangle" as ChartTool, icon: Square, label: "Rectangle Zone" },
    { id: "text" as ChartTool, icon: Type, label: "Text Label" },
  ]

  return (
    <div className="w-14 h-full bg-[#0a0a0a] border-r border-[#1e1e1e] flex flex-col items-center py-4 gap-2">
      {/* Drawing Tools */}
      {tools.map((tool) => {
        const Icon = tool.icon
        const isActive = activeTool === tool.id

        return (
          <Button
            key={tool.id}
            variant="ghost"
            size="icon"
            onClick={() => onToolChange(tool.id)}
            className={`w-10 h-10 relative group ${
              isActive
                ? "bg-primary/20 text-primary border border-primary/50"
                : "text-muted-foreground hover:text-foreground hover:bg-[#1e1e1e]"
            }`}
            title={tool.label}
          >
            <Icon className="w-5 h-5" />

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] border border-[#333] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {tool.label}
            </div>
          </Button>
        )
      })}

      {/* Divider */}
      <div className="w-8 h-px bg-[#1e1e1e] my-2" />

      {/* Clear Tool */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToolChange("clear")}
        className="w-10 h-10 relative group text-destructive hover:text-destructive hover:bg-destructive/10"
        title="Clear All Drawings"
      >
        <Eraser className="w-5 h-5" />

        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] border border-[#333] rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Clear All
        </div>
      </Button>
    </div>
  )
}
