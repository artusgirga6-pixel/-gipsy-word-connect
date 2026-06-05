import React from "react";
import { useI18n } from "@/i18n/I18nContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Volume2, VolumeX } from "lucide-react";
import { isMuted as audioIsMuted, toggleMuted } from "@/lib/audio";
import { useState } from "react";

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useI18n();
  const [muted, setMutedState] = useState(audioIsMuted());

  return (
    <div className="flex items-center gap-2">
      <Button
        data-testid="mute-toggle"
        variant="outline"
        size="icon"
        onClick={() => setMutedState(toggleMuted())}
        className="border-2 border-[#E8DFCA] rounded-xl bg-white/70 hover:bg-white"
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            data-testid="language-switcher"
            variant="outline"
            className="border-2 border-[#E8DFCA] rounded-xl bg-white/70 hover:bg-white gap-2"
          >
            <Globe className="w-4 h-4" />
            <span className="font-bold uppercase">{lang}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-white border-2 border-[#E8DFCA] rounded-xl"
        >
          {languages.map((l) => (
            <DropdownMenuItem
              key={l.code}
              data-testid={`language-option-${l.code}`}
              onSelect={() => setLang(l.code)}
              className={[
                "cursor-pointer rounded-lg font-semibold",
                l.code === lang ? "bg-[#FFFBF0] text-[#D92525]" : "text-[#2D2323]",
              ].join(" ")}
            >
              <span className="mr-2">{l.flag}</span> {l.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
