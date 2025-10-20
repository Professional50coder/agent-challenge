import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export function Flashcard({ front, back, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("relative w-full h-64 cursor-pointer", className)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isFlipped ? "back" : "front"}
          initial={{ rotateY: isFlipped ? -180 : 0, opacity: 0 }}
          animate={{ rotateY: isFlipped ? 0 : 180, opacity: 1 }}
          exit={{ rotateY: isFlipped ? 180 : -180, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-card rounded-lg shadow-lg p-6 backface-hidden"
        >
          <div className="h-full flex flex-col justify-between">
            <div className="flex-1">
              {isFlipped ? back : front}
            </div>
            <div className="text-xs text-muted-foreground text-center mt-4">
              Click to {isFlipped ? "show question" : "reveal answer"}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}