param(
    [ValidateSet('probe', 'start')][string]$Action = 'probe',
    [string]$ExecutablePath,
    [ValidateRange(0, 65535)][int]$Port = 0,
    [ValidateRange(1, 120)][int]$TimeoutSeconds = 30,
    [switch]$Apply
)

# 探测不启动或关闭进程。启动需要独立命令；退出客户端由操作者负责。
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
try {
    $instances = @(MainProcesses | ForEach-Object {
        $detectedPort = 0
        if ($_.CommandLine -match '--remote-debugging-port[=\s]+(\d+)') { $detectedPort = [int]$Matches[1] }
        $version = if ($_.ExecutablePath) { (Get-Item -LiteralPath $_.ExecutablePath).VersionInfo.FileVersion } else { $null }
        [pscustomobject]@{ pid = $_.ProcessId; executable = $_.ExecutablePath; version = $version; port = $detectedPort }
    })
    if ($Action -eq 'probe') {
        Emit @{ status = 'observed'; instances = $instances }
        exit 0
    }
    if (-not $ExecutablePath) { throw 'EXECUTABLE_REQUIRED: specify the discovered iCenter.exe path.' }
    $resolved = (Resolve-Path -LiteralPath $ExecutablePath).Path
    if ((Split-Path -Leaf $resolved) -ine 'iCenter.exe') { throw 'INVALID_EXECUTABLE: expected iCenter.exe.' }
    if ($instances.Count -gt 0) { throw 'CLIENT_RUNNING: use the existing connection or exit through the client UI before starting with CDP.' }
    if (-not $Apply) {
        Emit @{ status = 'preview'; action = 'start'; executable = $resolved; port = $Port }
        exit 0
    }
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    try { $listener.Start(); $Port = $listener.LocalEndpoint.Port } finally { $listener.Stop() }
    $clientProcess = Start-Process -FilePath $resolved -ArgumentList @('--remote-debugging-address=127.0.0.1', "--remote-debugging-port=$Port") -WindowStyle Hidden -PassThru
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        $pages = @()
        try { $pages = @(Targets $Port | Where-Object { $_.type -eq 'page' -and $_.url -eq 'app://./index.html' }) } catch { }
        if ($pages.Count -gt 0) {
            Emit @{ status = 'started'; pid = $clientProcess.Id; port = $Port; note = 'CDP target exists; query client status to verify login and identity.' }
            exit 0
        }
        Start-Sleep -Milliseconds 250
    } while ([DateTime]::UtcNow -lt $deadline)
    Emit @{ status = 'unknown'; error = @{ code = 'START_TIMEOUT'; message = 'Client was started; CDP readiness is unconfirmed. Inspect the process and login UI before retrying.' }; pid = $clientProcess.Id; port = $Port }
    exit 1
} catch {
    Emit @{ status = 'error'; error = @{ code = 'CONNECTION_SETUP'; message = $_.Exception.Message } }
    exit 1
}
