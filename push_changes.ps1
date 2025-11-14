# Script migliorato per automatizzare il push su GitHub con gestione degli errori e autenticazione

# Vai nella cartella del progetto
Set-Location -Path "D:\Generatore_Strutture\sito"

# Controllo se git è disponibile
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git non è installato o non è nel PATH. Installa Git e ripeti."
  exit 1
}

# Verifica che il remote sia configurato
$remote = git remote -v
if (-not $remote) {
  Write-Error "Nessun remote configurato. Aggiungi un remote con: git remote add origin <URL del tuo repository>."
  exit 1
}

# Aggiunge tutti i file modificati
git add .

# Verifica se ci sono modifiche da committare
$diff = git status --porcelain
if (-not $diff) {
  Write-Output "Nessuna modifica da pushare."
  exit 0
}

# Commit automatico con messaggio dinamico (usa timestamp se non specificato)
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$commitMsg = "Aggiornamento automatico - $timestamp"
git commit -m "$commitMsg"

# Push sul branch principale
Write-Output "Eseguo git push origin master..."
try {
  git push origin master
  Write-Output "Push completato con successo!"
} catch {
  Write-Error "Errore durante il push: $_.Exception.Message"
  exit 1
}
