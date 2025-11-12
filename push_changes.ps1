# Script completamente automatizzato per aggiungere, committare e pushare le modifiche

# Vai nella cartella del progetto
Set-Location -Path "D:\Generatore_Strutture\sito"

# Controllo se git è disponibile
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git non è installato o non è nel PATH. Installa Git e ripeti."
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

# Commit automatico con messaggio predefinito
$commitMsg = "Aggiornamento automatico delle modifiche"
git commit -m "$commitMsg"

# Push sul branch master
Write-Output "Eseguo git push origin master..."
try {
  git push origin master
  Write-Output "Push completato con successo!"
} catch {
  Write-Error "Errore durante il push: $_.Exception.Message"
}
