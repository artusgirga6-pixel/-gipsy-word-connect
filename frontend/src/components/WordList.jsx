import React from "react";

export default function WordList({ words, foundWords }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center" data-testid="word-list">
      {words.map((word) => {
        const isFound = foundWords.has(word);
        return (
          <span
            key={word}
            data-testid={`word-list-item-${word}`}
            className={[
              "px-3 py-1.5 rounded-full border-2 font-semibold text-sm sm:text-base transition-all",
              isFound
                ? "bg-[#2B8C44] text-white border-transparent line-through opacity-80 scale-95"
                : "bg-white text-[#5C4B4B] border-[#E8DFCA] hover:border-[#D92525]",
            ].join(" ")}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
