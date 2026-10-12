param([string]$Scenario, [string]$ConnectionScript, [string]$ClientExecutable)
. $ConnectionScript -Action ensure
if ($Scenario -eq 'native-stop') {
    $script:HelperProcesses = @()
    try {
        foreach ($index in 1..2) {
            $script:HelperProcesses += Start-Process -FilePath "$PSHOME/powershell.exe" -ArgumentList '-NoProfile -NonInteractive -Command "Start-Sleep -Seconds 60"' -WindowStyle Hidden -PassThru
        }
        function MainProcesses {
            Get-CimInstance Win32_Process -Filter "name='powershell.exe'" | Where-Object { $_.ProcessId -in $script:HelperProcesses.Id }
        }
        $selected = MainProcesses | Where-Object { $_.ProcessId -eq $script:HelperProcesses[0].Id }
        StopInstance $selected
        Emit @{ selectedStopped = $script:HelperProcesses[0].HasExited; otherAlive = -not $script:HelperProcesses[1].HasExited }
    } finally {
        foreach ($helper in $script:HelperProcesses) {
            if (-not $helper.HasExited) { Stop-Process -Id $helper.Id -Force -ErrorAction SilentlyContinue }
            $helper.Dispose()
        }
    }
    exit 0
}
$script:Calls = @{ started = @(); stopped = @(); waited = @(); inspected = @() }
$script:FixtureProcesses = @()
$script:ExecutablePath = $null
$script:Restart = $false
$script:InstancePid = 0
function FixtureInstance([int]$Id, [string]$Arguments) {
    [pscustomobject]@{ ProcessId = $Id; ExecutablePath = $ClientExecutable; CommandLine = "`"$ClientExecutable`" $Arguments" }
}
function MainProcesses { $script:FixtureProcesses }
function InstalledExecutables {
    if ($Scenario -eq 'ambiguous-install') { return @($ClientExecutable, "$ClientExecutable.other") }
    return @($ClientExecutable)
}
function Start-Process {
    param($FilePath, $WorkingDirectory, $ArgumentList, $WindowStyle, [switch]$PassThru)
    $script:Calls.started += @{ executable = $FilePath; arguments = $ArgumentList; windowStyle = $WindowStyle }
    [pscustomobject]@{ Id = 9001 }
}
function AwaitTargets([int]$CdpPort) {
    $script:Calls.waited += $CdpPort
    if ($Scenario -eq 'unreachable') { throw 'CDP_NOT_READY: fixture endpoint is unreachable.' }
}
if ($Scenario -eq 'normal-close') {
    function Get-Process {
        param([int]$Id)
        $script:Calls.inspected += $Id
        $process = [pscustomobject]@{ Id = $Id; HasExited = $false }
        $process | Add-Member ScriptMethod CloseMainWindow {
            $this.HasExited = $true
            $script:Calls.stopped += $this.Id
            $script:FixtureProcesses = @($script:FixtureProcesses | Where-Object { $_.ProcessId -ne $this.Id })
            return $true
        }
        $process
    }
} else {
    function StopInstance($Instance) {
        $script:Calls.stopped += $Instance.ProcessId
        $script:FixtureProcesses = @($script:FixtureProcesses | Where-Object { $_.ProcessId -ne $Instance.ProcessId })
    }
}
switch ($Scenario) {
    { $_ -in 'reuse', 'unreachable' } {
        $script:FixtureProcesses = @(FixtureInstance 701 '--remote-debugging-port=43123')
        $script:Restart = $true
    }
    'restart-required' { $script:FixtureProcesses = @(FixtureInstance 701 '') }
    { $_ -in 'multiple', 'selected-restart', 'normal-close' } {
        $script:FixtureProcesses = @((FixtureInstance 701 ''), (FixtureInstance 702 '--user-data-dir="C:\profile folder" --profile=test'))
        $script:Restart = $true
        if ($Scenario -ne 'multiple') { $script:InstancePid = 702 }
    }
    'explicit-start' { $script:ExecutablePath = $ClientExecutable }
}
try { $result = InvokeConnection }
catch { $failure = @{ message = $_.Exception.Message; details = $script:ConnectionContext } }
Emit @{ result = $result; error = $failure; calls = $script:Calls; remainingPids = @($script:FixtureProcesses | ForEach-Object { $_.ProcessId }) }
