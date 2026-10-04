; INNO Setup Script for YAS Hardware Agent Windows Service
; Script Version: 1.0
; Compile with: "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" YAS-Hardware-Agent.iss

[Setup]
AppName=YAS Hardware Agent
AppVersion=1.0.0
AppPublisher=YAS
AppPublisherURL=https://yas-laptop-diagnostic.vercel.app
AppSupportURL=https://yas-laptop-diagnostic.vercel.app
AppUpdatesURL=https://yas-laptop-diagnostic.vercel.app
DefaultDirName={autopf}\YAS Hardware Agent
DefaultGroupName=YAS
OutputDir=..\downloads
OutputBaseFilename=YAS-Hardware-Agent-Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
ChangesEnvironment=no
AlwaysShowComponentsList=no
ShowComponentSizes=no
AllowUNCPath=no
ArchitecturesInstallIn64BitMode=x64
ArchitecturesAllowed=x64

; RTL Support for Arabic
RTLLanguage=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"

[CustomMessages]
arabic.ServiceInstalled=تم تثبيت خدمة Windows بنجاح
arabic.ServiceStarted=تم بدء الخدمة
arabic.ServiceFailed=فشل تثبيت الخدمة
english.ServiceInstalled=Windows Service installed successfully
english.ServiceStarted=Service started successfully
english.ServiceFailed=Failed to install the service

[Files]
; Copy all files from publish directory
Source: "..\hardware-agent\publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{cm:UninstallProgram,YAS Hardware Agent}"; Filename: "{uninstallexe}"

[Run]
; Start service after installation
Filename: "{sys}\sc.exe"; Parameters: "create YASHardwareAgent binPath=""{app}\YAS.HardwareAgent.exe"" DisplayName=""YAS Hardware Agent"" start=auto type=own"; Flags: runhidden; StatusMsg: "Installing Windows Service..."; Check: not ServiceExists

[UninstallRun]
; Stop and remove service
Filename: "{sys}\sc.exe"; Parameters: "stop YASHardwareAgent"; Flags: runhidden; RunOnceId: "StopService"
Filename: "{sys}\sc.exe"; Parameters: "delete YASHardwareAgent"; Flags: runhidden; RunOnceId: "DeleteService"

[Code]
function ServiceExists: Boolean;
var
  ExecResult: Integer;
begin
  ExecResult := 0;
  if not Exec(ExpandConstant('{sys}\sc.exe'), 'query YASHardwareAgent', '', SW_HIDE, ewWaitUntilTerminated, ExecResult) then
  begin
    Result := False
  end
  else if ExecResult <> 0 then
  begin
    Result := False
  end
  else
  begin
    Result := True
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ExecResult: Integer;
  ServiceMsg: String;
begin
  if CurStep = ssPostInstall then
  begin
    if not ServiceExists then
    begin
      if Exec(ExpandConstant('{sys}\sc.exe'), 'create YASHardwareAgent binPath=""{app}\YAS.HardwareAgent.exe"" DisplayName=""YAS Hardware Agent"" start=auto type=own', '', SW_HIDE, ewWaitUntilTerminated, ExecResult) then
      begin
        if ExecResult = 0 then
        begin
          // Configure recovery
          Exec(ExpandConstant('{sys}\sc.exe'), 'failure YASHardwareAgent reset=300 actions=restart/5000/restart/5000/restart/5000', '', SW_HIDE, ewWaitUntilTerminated, ExecResult);
          
          // Start the service
          Exec(ExpandConstant('{sys}\sc.exe'), 'start YASHardwareAgent', '', SW_HIDE, ewWaitUntilTerminated, ExecResult);
          
          MsgBox(CustomMessage('ServiceInstalled'), mbInformation, MB_OK);
        end
        else
        begin
          MsgBox(CustomMessage('ServiceFailed'), mbError, MB_OK);
        end;
      end
      else
      begin
        MsgBox(CustomMessage('ServiceFailed'), mbError, MB_OK);
      end;
    end;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  ExecResult: Integer;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    // Ensure service is stopped
    Exec(ExpandConstant('{sys}\sc.exe'), 'stop YASHardwareAgent', '', SW_HIDE, ewWaitUntilTerminated, ExecResult);
    Sleep(1000);
    
    // Remove service
    Exec(ExpandConstant('{sys}\sc.exe'), 'delete YASHardwareAgent', '', SW_HIDE, ewWaitUntilTerminated, ExecResult);
  end;
end;
