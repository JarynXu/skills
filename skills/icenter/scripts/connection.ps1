param(
    [ValidateSet('probe', 'ensure', 'start')][string]$Action = 'probe',
    [string]$ExecutablePath,
    [int]$InstancePid = 0,
    [ValidateRange(0, 65535)][int]$Port = 0,
    [ValidateRange(1, 120)][int]$TimeoutSeconds = 30,
    [switch]$Apply,
    [switch]$Restart
)

# probe 只读；ensure 复用或启动 CDP，重启限定在显式选择的实例。
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
function Emit($Value) { [Console]::Out.WriteLine(($Value | ConvertTo-Json -Compress -Depth 8)) }
function MainProcesses {
    @(Get-CimInstance Win32_Process -Filter "name='iCenter.exe'" | Where-Object { $_.CommandLine -notmatch '(?:^|\s)--type=' })
}
function Targets([int]$CdpPort) {
    if ($CdpPort -eq 0) { return @() }
    @(Invoke-RestMethod -Uri "http://127.0.0.1:$CdpPort/json/list" -TimeoutSec 2 -Method Get)
}

function InstalledExecutables {
    $candidates = @()
    $command = Get-Command iCenter.exe -CommandType Application -ErrorAction SilentlyContinue
    if ($command) { $candidates += $command.Source }
    foreach ($key in @(
        'HKCU:\Software\Microsoft\Windows\CurrentVersion\App Paths\iCenter.exe',
        'HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\iCenter.exe'
    )) {
        if (Test-Path -LiteralPath $key) { $candidates += (Get-Item -LiteralPath $key).GetValue('') }
    }
    foreach ($root in @(
        'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
        'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
        'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
    )) {
        foreach ($entry in @(Get-ItemProperty $root -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like '*iCenter*' })) {
            if ($entry.InstallLocation) { $candidates += Join-Path $entry.InstallLocation 'iCenter.exe' }
            if ($entry.DisplayIcon -match '^"?(.+?\.exe)"?(?:,\d+)?$') { $candidates += $Matches[1] }
        }
    }
    @($candidates | Where-Object { $_ -and (Split-Path -Leaf $_) -ieq 'iCenter.exe' -and (Test-Path -LiteralPath $_ -PathType Leaf) } | ForEach-Object { (Resolve-Path -LiteralPath $_).Path } | Sort-Object -Unique)
}

function StopInstance($Instance) {
    # Restart 的调用方已确认可中断该实例；先正常关闭，托盘驻留时只终止该进程树。
    $native = Get-Process -Id $Instance.ProcessId -ErrorAction SilentlyContinue
    if ($native) {
        $null = $native.CloseMainWindow()
        $deadline = [DateTime]::UtcNow.AddSeconds(3)
        while (-not $native.HasExited -and [DateTime]::UtcNow -lt $deadline) { Start-Sleep -Milliseconds 200; $native.Refresh() }
        if (-not $native.HasExited) {
            $null = & taskkill.exe /PID $Instance.ProcessId /T /F 2>&1
            if ($LASTEXITCODE -ne 0 -and (Get-Process -Id $Instance.ProcessId -ErrorAction SilentlyContinue)) { throw 'STOP_FAILED: the selected instance did not stop.' }
        }
    }
    if (@(MainProcesses | Where-Object { $_.ProcessId -eq $Instance.ProcessId }).Count) { throw 'STOP_FAILED: the selected instance is still running.' }
}

function AwaitTargets([int]$CdpPort) {
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        try {
            $pages = @(Targets $CdpPort | Where-Object { $_.type -eq 'page' -and $_.url -eq 'app://./index.html' })
            if ($pages.Count -gt 0) { return }
        } catch { $lastFailure = $_.Exception.Message }
        Start-Sleep -Milliseconds 250
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "CDP_NOT_READY: CDP readiness is unconfirmed on port $CdpPort. Inspect the existing instance before retrying. $lastFailure"
}

function InvokeConnection {
    $processes = @(MainProcesses)
    $instances = @($processes | ForEach-Object {
        $detectedPort = 0
        if ($_.CommandLine -match '--remote-debugging-port[=\s]+(\d+)') { $detectedPort = [int]$Matches[1] }
        $version = if ($_.ExecutablePath) { (Get-Item -LiteralPath $_.ExecutablePath).VersionInfo.FileVersion } else { $null }
        [pscustomobject]@{ pid = $_.ProcessId; executable = $_.ExecutablePath; version = $version; port = $detectedPort }
    })
    if ($Action -eq 'probe') {
        return @{ status = 'observed'; instances = $instances }
    }
    $selected = $null
    if ($InstancePid) {
        $matchesByPid = @($processes | Where-Object { $_.ProcessId -eq $InstancePid })
        if ($matchesByPid.Count -ne 1) { throw 'INSTANCE_NOT_FOUND: rediscover the requested process.' }
        $selected = $matchesByPid[0]
    } elseif ($processes.Count -eq 1) { $selected = $processes[0] }
    elseif ($processes.Count -gt 1) { throw 'INSTANCE_NOT_UNIQUE: specify InstancePid from probe; never restart all instances.' }

    if ($Action -eq 'start' -and $processes.Count -gt 0) { throw 'CLIENT_RUNNING: use ensure to connect the selected instance.' }
    if ($selected -and $Action -eq 'ensure') {
        $current = @($instances | Where-Object { $_.pid -eq $selected.ProcessId })[0]
        $script:ConnectionContext = @{ pid = $current.pid; port = $current.port; restarted = $false }
        if ($current.port -gt 0) {
            AwaitTargets $current.port
            return @{ status = 'connected'; pid = $current.pid; port = $current.port; restarted = $false }
        }
        if (-not $Restart) { throw 'RESTART_REQUIRED: the selected client has no CDP port. Preserve unfinished work, then use Restart to enable CDP.' }
        if ($ExecutablePath -and (Resolve-Path -LiteralPath $ExecutablePath).Path -ine $selected.ExecutablePath) { throw 'EXECUTABLE_MISMATCH: restart must use the selected instance executable.' }
        $ExecutablePath = $selected.ExecutablePath
    }
    if (-not $ExecutablePath) {
        $installed = @(InstalledExecutables)
        if ($installed.Count -eq 0) { throw 'EXECUTABLE_REQUIRED: no registered iCenter.exe was found; supply its actual path.' }
        if ($installed.Count -gt 1) { throw 'INSTALLATION_NOT_UNIQUE: supply the intended iCenter.exe path.' }
        $ExecutablePath = $installed[0]
    }
    $resolved = (Resolve-Path -LiteralPath $ExecutablePath).Path
    if ((Split-Path -Leaf $resolved) -ine 'iCenter.exe') { throw 'INVALID_EXECUTABLE: expected iCenter.exe.' }
    if ($Action -eq 'start' -and -not $Apply) {
        return @{ status = 'preview'; action = 'start'; executable = $resolved; port = $Port }
    }
    $launchArguments = ''
    if ($selected) {
        if ($selected.CommandLine -notmatch '^\s*(?:"[^"]+"|\S+)\s*(.*)$') { throw 'INVALID_COMMAND_LINE: cannot preserve the instance launch arguments.' }
        $launchArguments = $Matches[1] -replace '(?:^|\s)--remote-debugging-(?:address|port)(?:=|\s+)\S+', ''
    }
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    try { $listener.Start(); $Port = $listener.LocalEndpoint.Port } finally { $listener.Stop() }
    if ($selected) { StopInstance $selected }
    $clientProcess = Start-Process -FilePath $resolved -WorkingDirectory (Split-Path -Parent $resolved) -ArgumentList "$launchArguments --remote-debugging-address=127.0.0.1 --remote-debugging-port=$Port" -WindowStyle Hidden -PassThru
    $script:ConnectionContext = @{ pid = $clientProcess.Id; port = $Port; restarted = ($null -ne $selected) }
    AwaitTargets $Port
    return @{ status = 'started'; pid = $clientProcess.Id; port = $Port; restarted = ($null -ne $selected) }
}

if ($MyInvocation.InvocationName -ne '.') {
    try { Emit (InvokeConnection) }
    catch {
        $message = $_.Exception.Message
        $code = if ($message -match '^([A-Z_]+):') { $Matches[1] } else { 'CONNECTION_SETUP' }
        Emit @{ ok = $false; status = 'error'; error = @{ code = $code; message = $message; details = $script:ConnectionContext } }
        exit 1
    }
}
