"use client"

import { Button } from "@/components/ui/button"
import { useControls } from "react-zoom-pan-pinch"

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  
  return (
    <div className="fixed bottom-6 left-7 space-x-2 z-30 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md h-[40px] ">
      <Button 
        onClick={() => resetTransform()} 
        className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
        aria-label="Reset zoom"
      >
        ↺
      </Button>
      <Button 
        onClick={() => zoomOut()} 
        className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        aria-label="Zoom out"
      >
        -
      </Button>
      <Button 
        onClick={() => zoomIn()} 
        className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        aria-label="Zoom in"
      >
        +
      </Button>
    </div>
  );
};

export default Controls;