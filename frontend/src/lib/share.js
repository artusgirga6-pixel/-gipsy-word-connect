// Share helper: uses Web Share API when available, falls back to clipboard.
export async function shareOrCopy({ title, text, url }) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return "shared";
    } catch (e) {
      // user cancelled or share failed; try clipboard
    }
  }
  const payload = [text, shareUrl].filter(Boolean).join("\n");
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(payload);
      return "copied";
    }
  } catch {}
  // fallback: legacy execCommand
  try {
    const ta = document.createElement("textarea");
    ta.value = payload;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return "copied";
  } catch {
    return "failed";
  }
}
