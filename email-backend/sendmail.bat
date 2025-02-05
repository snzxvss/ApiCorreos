@echo off
setlocal enabledelayedexpansion

set FROM=%~1
set TO=%~2
set SUBJECT=%~3
set BODY=%~4

"C:\Strawberry\perl\bin\perl.exe" "%~dp0swaks.pl" --auth --server smtp.mailgun.org --port 587 --au test@camilosanz.tech --ap sanzvoss --from !FROM! --to !TO! --h-Subject: !SUBJECT! --h-From: "<!FROM!>" --body !BODY!

endlocal