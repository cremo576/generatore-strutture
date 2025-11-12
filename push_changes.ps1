# Script helper per fare il push delle modifiche al repository remoto
# IMPORTANTE: esegui questo script nella tua macchina dove hai le credenziali Git configurate.
# Apri PowerShell come utente e lancia: .\push_changes.ps1

# Vai nella cartella del progetto
Set-Location -Path "D:\Generatore_Strutture\sito"

# Controllo se git è disponibile
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git non è installato o non è nel PATH. Installa Git e ripeti."
  exit 1
}

# Mostra stato
Write-Output "Git status prima delle modifiche:"
git status

# Aggiunge tutti i file modificati
git add .

# Se non ci sono cambi da commit, informa e termina
$diff = git status --porcelain
if (-not $diff) {
  Write-Output "Nessuna modifica da pushare."
  exit 0
}

# Commit (modifica il testo del commit se vuoi)
$commitMsg = Read-Host "Messaggio di commit (premi Invio per usare 'Aggiornamento da local')"
if (-not $commitMsg) { $commitMsg = "Aggiornamento da local" }

git commit -m "$commitMsg"

# Verifica remote
$remote = git remote -v
Write-Output "Remote configurati:`n$remote"

# Push sul branch main (cambia branch se usi altro)
Write-Output "Eseguo git push origin main..."
try {
  git push origin main
  Write-Output "Push completato. Controlla la pagina GitHub per il deploy su Cloudflare Pages."
} catch {
  Write-Error "Errore durante il push: $_.Exception.Message"
  Write-Output "Se il repository remoto non è impostato, aggiungilo con: git remote add origin https://github.com/TUO-USERNAME/NOME-REPO.git"
}
