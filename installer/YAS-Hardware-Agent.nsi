; NSIS Script for YAS Hardware Agent Installer
; Version 1.0.0

!include "MUI2.nsh"
!include "x64.nsh"

; Define application constants
!define APP_NAME "YAS Hardware Agent"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "YAS"
!define APP_ICON "icon.ico"
!define APP_EXECUTABLE "YAS.HardwareAgent.exe"
!define INSTALL_DIR "C:\Program Files\YAS Hardware Agent"

; Installer settings
Name "${APP_NAME} ${APP_VERSION}"
OutFile "YAS-Hardware-Agent-Setup.exe"
InstallDir "${INSTALL_DIR}"
InstallDirRegKey HKCU "Software\YAS\HardwareAgent" "InstallLocation"

; Ensure we're on Windows
CRCCheck on
SetCompress auto
SetDatablockOptimize on
XPStyle on

; Request administrator privileges
RequestExecutionLevel admin

; MUI Settings
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Arabic"

; Installer section
Section "YAS Hardware Agent" SEC_MAIN
  SetOutPath "$INSTDIR"
  
  ; Copy all files from publish directory
  File /r "..\hardware-agent\publish\*.*"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Write registry entries
  WriteRegStr HKCU "Software\YAS\HardwareAgent" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\YAS\HardwareAgent" "Version" "${APP_VERSION}"
  WriteRegStr HKCU "Software\YAS\HardwareAgent" "Path" "$INSTDIR\${APP_EXECUTABLE}"
  
  ; Create Start Menu shortcut
  CreateDirectory "$SMPROGRAMS\YAS Hardware Agent"
  CreateShortCut "$SMPROGRAMS\YAS Hardware Agent\YAS Hardware Agent.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
  CreateShortCut "$SMPROGRAMS\YAS Hardware Agent\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
  
  ; Create Desktop shortcut (optional)
  CreateShortCut "$DESKTOP\YAS Hardware Agent.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
  
  ; Register application in Add/Remove Programs
  WriteRegStr HKU "Software\Microsoft\Windows\CurrentVersion\Uninstall\YAS_HardwareAgent" "DisplayName" "${APP_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\YAS_HardwareAgent" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\YAS_HardwareAgent" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\YAS_HardwareAgent" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\YAS_HardwareAgent" "InstallLocation" "$INSTDIR"
  
  ; Register for Auto-Start via Task Scheduler
  DetailPrint "Setting up auto-start..."
  SetOutPath "$INSTDIR"
  ExecWait 'cmd /c $INSTDIR\setup-autostart.bat' 0
  
  ; Start the application
  DetailPrint "Starting YAS Hardware Agent..."
  ExecWait '$INSTDIR\${APP_EXECUTABLE} &' 0
  
  DetailPrint "Installation completed successfully!"
SectionEnd

; Uninstaller section
Section "Uninstall"
  SetShellVarContext current
  
  ; Stop the application if running
  DetailPrint "Stopping YAS Hardware Agent..."
  ExecWait 'taskkill /IM ${APP_EXECUTABLE} /F' 0
  
  ; Remove Task Scheduler task
  DetailPrint "Removing auto-start configuration..."
  ExecWait 'schtasks /delete /tn "YAS Hardware Agent" /f' 0
  
  ; Remove files
  RMDir /r "$INSTDIR"
  
  ; Remove Start Menu
  RMDir /r "$SMPROGRAMS\YAS Hardware Agent"
  
  ; Remove Desktop shortcut
  Delete "$DESKTOP\YAS Hardware Agent.lnk"
  
  ; Remove registry entries
  DeleteRegKey HKCU "Software\YAS\HardwareAgent"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\YAS_HardwareAgent"
  
  DetailPrint "Uninstallation completed!"
SectionEnd

; Language strings
LangString DESC_Main ${LANG_ENGLISH} "Install YAS Hardware Agent for real hardware detection"
LangString DESC_Main ${LANG_ARABIC} "تثبيت مساعد فحص الجهاز YAS للكشف الحقيقي عن مكونات الجهاز"

LangString WELCOME_TITLE ${LANG_ENGLISH} "Welcome to YAS Hardware Agent Setup"
LangString WELCOME_TITLE ${LANG_ARABIC} "أهلا بك في برنامج تثبيت مساعد فحص الجهاز YAS"

LangString WELCOME_TEXT ${LANG_ENGLISH} "This installer will set up YAS Hardware Agent on your computer.$\n$\nThe agent will start automatically after installation.$\n$\nClick Next to continue."
LangString WELCOME_TEXT ${LANG_ARABIC} "سيقوم برنامج التثبيت هذا بإعداد مساعد فحص الجهاز على جهازك.$\n$\nسيبدأ المساعد تلقائياً بعد التثبيت.$\n$\nاضغط التالي للمتابعة."

LangString FINISH_TEXT ${LANG_ENGLISH} "YAS Hardware Agent has been installed successfully!$\n$\nThe agent is now running on http://127.0.0.1:5275$\n$\nYou can now return to the diagnostic website to run hardware detection."
LangString FINISH_TEXT ${LANG_ARABIC} "تم تثبيت مساعد فحص الجهاز بنجاح!$\n$\nالمساعد يعمل الآن على http://127.0.0.1:5275$\n$\nيمكنك العودة إلى موقع الفحص لإجراء فحص الجهاز."
