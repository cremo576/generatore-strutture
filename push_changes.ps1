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

# Aggiungo un messaggio di commit predefinito per automatizzare il processo
$commitMsg = "Aggiornamento automatico delle modifiche"  # Messaggio predefinito

# Aggiunge tutti i file modificati
git add .

# Commit automatico con il messaggio predefinito
git commit -m "$commitMsg"

# Verifica remote
$remote = git remote -v
Write-Output "Remote configurati:`n$remote"

# Push sul branch master (cambia branch se usi altro)
Write-Output "Eseguo git push origin master..."
try {
  git push origin master
  Write-Output "Push completato con successo!"
} catch {
  Write-Error "Errore durante il push: $_.Exception.Message"
}
