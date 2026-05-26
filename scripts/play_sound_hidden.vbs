' play_sound_hidden.vbs — Launch play_sound.ps1 with hidden window
' Usage: wscript.exe //B play_sound_hidden.vbs "Windows Ding"
If WScript.Arguments.Count = 0 Then WScript.Quit 1

sound = WScript.Arguments(0)
cmd = "powershell -ExecutionPolicy Bypass -File ""C:\Users\Administrator\.claude\scripts\play_sound.ps1"" -sound """ & sound & """"

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run cmd, 0, False
