# Come fare il push delle modifiche verso GitHub (e triggerare il deploy su Cloudflare Pages)

Questo repository contiene lo script helper `push_changes.ps1` che puoi eseguire nella tua macchina Windows per committare e fare push delle modifiche.

Passaggi rapidi (consigliati)

1. Apri PowerShell come utente.
2. Vai nella cartella del progetto (se non sei già lì):

```powershell
cd E:\Generatore_Strutture
```

3. Se non hai ancora configurato il remote Git (solo la prima volta), crea il repo su GitHub via web e poi aggiungi il remote (sostituisci con il tuo URL):

```powershell
git remote add origin https://github.com/TUO-USERNAME/generatore-strutture.git
```

4. Esegui lo script helper (nella stessa cartella):

```powershell
.\push_changes.ps1
```

Lo script farà:
- `git status` per mostrarti lo stato
- `git add .` per aggiungere tutte le modifiche
- ti chiederà il messaggio di commit (se premi Enter userà "Aggiornamento da local")
- `git commit -m "..."`
- `git push origin main`

Se non vuoi usare lo script, puoi eseguire manualmente i comandi:

```powershell
cd E:\Generatore_Strutture
git add .
git commit -m "Descrizione delle modifiche"
git push origin main
```

Problemi comuni

- "git: command not found": significa che Git non è installato o non è nel PATH. Installa Git da https://git-scm.com/download/win e riavvia PowerShell.
- Errori di autenticazione (username/password o token):
  - Dal 2021 GitHub richiede token (PAT) per login via HTTPS oppure l'uso di SSH.
  - Se preferisci, configura le credenziali tramite `git credential manager` o usa SSH.

Verifica deploy su Cloudflare Pages

- Dopo il push, apri Cloudflare → Pages → il tuo progetto → Deploys per vedere lo stato della build.
- Quando il deploy è "Success", apri l'URL pubblico (es. https://<tuo-progetto>.pages.dev) e ricarica la pagina.

Nota sulla sicurezza

- Non condividere le tue credenziali GitHub. Questo script semplicemente esegue git sul tuo computer: dovrai autenticarti tu quando richiesto.

Se vuoi, posso:
- aiutarti a configurare il remote se mi incolli l'URL del tuo repo;
- creare una breve commit di prova e mostrarti i comandi esatti da incollare in PowerShell;
- guidarti passo‑passo via messaggi mentre esegui i comandi.
