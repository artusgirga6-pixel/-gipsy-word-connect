import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function OnboardingModal({ open, onSubmit, onSkip }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const submit = (withName) => {
    onSubmit(withName ? name.trim() : "");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onSkip(); }}>
      <DialogContent
        className="bg-white/95 backdrop-blur-xl border-2 border-[#E8DFCA] rounded-3xl"
        data-testid="onboarding-modal"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#D92525] uppercase tracking-[0.15em] text-xs font-bold">
            <Sparkles className="w-4 h-4" /> {t("app.subtitle")}
          </div>
          <DialogTitle
            className="text-2xl sm:text-3xl text-[#1E3A8A] mt-2"
            style={{ fontFamily: "Fredoka, sans-serif" }}
          >
            {t("onboarding.title")}
          </DialogTitle>
          <DialogDescription className="text-[#5C4B4B] text-base">
            {t("onboarding.subtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Input
            data-testid="onboarding-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("onboarding.placeholder")}
            maxLength={24}
            className="border-2 border-[#E8DFCA] rounded-xl text-base h-12"
            onKeyDown={(e) => { if (e.key === "Enter") submit(true); }}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <Button
            data-testid="onboarding-skip-button"
            variant="outline"
            onClick={() => submit(false)}
            className="border-2 border-[#E8DFCA] text-[#5C4B4B] rounded-xl"
          >
            {t("btn.skip")}
          </Button>
          <Button
            data-testid="onboarding-save-button"
            onClick={() => submit(true)}
            className="flex-1 bg-[#D92525] hover:bg-[#B81E1E] text-white font-bold rounded-xl shadow-[0_4px_0_0_#A31A1A] hover:shadow-[0_2px_0_0_#A31A1A] active:translate-y-1 active:shadow-none transition-all"
          >
            {t("btn.play")} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
