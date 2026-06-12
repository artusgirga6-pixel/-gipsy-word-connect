# Ako získať APK / AAB pre Google Play — krok za krokom

Aplikáciu **nemôžem zostaviť priamo v tomto prostredí** (kontajner je ARM64, ale Android SDK potrebuje x86_64). Preto je už pripravený **cloud build cez GitHub Actions** — ty len stlačíš tlačidlo a GitHub ti vyrobí inštalačné súbory.

## Čo z toho vznikne

GitHub Actions po dokončení buildu vyhodí 3 artefakty:

| Súbor | Na čo slúži |
|---|---|
| `gipsy-word-connect-debug-apk` | APK na rýchle vyskúšanie na svojom telefóne (sideload) |
| `gipsy-word-connect-release-apk` | Release APK (podpísaný, ak si nastavil keystore) |
| `gipsy-word-connect-release-aab` | **AAB pre Google Play** (toto nahráš do Play Console) |

---

## Krok 1 — Pošli kód na GitHub

V Emergent chate klikni **Save to Github** a nahraj repo. Po pushi sa workflow `Build Android APK + AAB` spustí automaticky.

## Krok 2 — Vygeneruj si vlastný keystore (jednorazovo)

Na svojom počítači (Mac / Linux / Windows s JDK 17+) spusti:

```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias gipsywordconnect \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

Pýta si:
- **Heslo na keystore** — zapamätaj si ho!
- **Meno, organizácia, mesto, krajina** — vypíš čo chceš (nezáleží na presnosti).
- **Heslo na kľúč (alias)** — môže byť rovnaké ako heslo na keystore.

> ⚠️ **Uchovaj `release.keystore` na bezpečnom mieste!** Bez neho neskôr nedokážeš vydať aktualizáciu aplikácie na Google Play.

Potom keystore zakóduj do base64 (pre vloženie do GitHub Secrets):

```bash
# macOS / Linux
base64 -i release.keystore | tr -d '\n' > release.keystore.b64
cat release.keystore.b64    # toto je dlhý reťazec, ktorý skopíruješ
```

## Krok 3 — Nastav GitHub Secrets

Na GitHub-e: **Settings → Secrets and variables → Actions → New repository secret**.

Pridaj presne tieto 4 secrets:

| Názov secret | Hodnota |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | obsah `release.keystore.b64` (jeden dlhý reťazec) |
| `ANDROID_KEYSTORE_PASSWORD` | heslo, ktoré si zadal pri `keytool` |
| `ANDROID_KEY_ALIAS` | `gipsywordconnect` |
| `ANDROID_KEY_PASSWORD` | heslo na alias (často rovnaké) |

## Krok 4 — Spusti build manuálne

Na GitHub-e otvor **Actions → Build Android APK + AAB → Run workflow**.

Po ~5 minútach uvidíš úspešný build. Klikni naň a v sekcii **Artifacts** stiahneš `gipsy-word-connect-release-aab.zip`. Vo vnútri je `app-release.aab`.

## Krok 5 — Nahraj na Google Play Console

1. Choď na [play.google.com/console](https://play.google.com/console)
2. Vytvor novú aplikáciu (Application name: "Gipsy Word Connect")
3. **Production → Create new release → Upload** → vyber `app-release.aab`
4. Vyplň popisy, screenshoty, ikonu, kategórie (vzdelávacie / slovné hry)
5. **Send for review** — Google ti to schváli za 1–3 dni

---

## Rýchla cesta (bez Play Console) — len sideload na svoj telefón

Ak chceš aplikáciu len vyskúšať na svojom telefóne:

1. Spusti workflow (krok 1 a 4 vyššie — Secrets môžeš zatiaľ vynechať)
2. Stiahni artefakt `gipsy-word-connect-debug-apk`
3. Prenes APK na telefón (USB, e-mail, Google Drive)
4. V telefóne povol **"Inštalovať z neznámych zdrojov"** pre prehliadač / Files
5. Klikni na APK → Inštalovať

---

## Build IDs už pripravené v aplikácii

- `applicationId`: `com.gipsywordconnect.app`
- `versionCode`: `1`
- `versionName`: `1.0`
- AdMob App ID, Interstitial ID, Rewarded ID: tvoje reálne produkčné ID

Pri ďalšej verzii zvýš `versionCode` na 2, 3, ... v `/app/frontend/android/app/build.gradle`.
