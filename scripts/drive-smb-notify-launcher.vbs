Set shell = CreateObject("WScript.Shell")
shell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""C:\wardrobe_app_local\scripts\drive-smb-notify.ps1""", 0, False
