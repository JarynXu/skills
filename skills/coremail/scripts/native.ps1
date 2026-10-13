# Windows UI Automation + Win32; no desktop-control plugin.
[CmdletBinding()]
param(
    [ValidateSet('windows','inspect','show','focus','ribbon','click','double-click','context','select-item','set-value','key','close')][string]$Action = 'windows',
    [int]$ClientPid,
    [long]$Window,
    [string]$WindowTitle,
    [string]$RuntimeId,
    [AllowEmptyString()][string]$ExpectedName,
    [AllowEmptyString()][string]$Value,
    [string]$Text,
    [string[]]$Keys,
    [switch]$Apply
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
if ($PSVersionTable.PSEdition -eq 'Core') { throw 'Run this adapter with Windows powershell.exe 5.1 (built into Windows), not pwsh.' }
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes, Accessibility
Add-Type -ReferencedAssemblies ([Accessibility.IAccessible].Assembly.Location) -TypeDefinition @'
using System;
using System.Text;
using Accessibility;
using System.Runtime.InteropServices;
public static class CmNative {
  public class AccItem { public int id,x,y,width,height; public string name; public object state; }
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr h,uint id,ref Guid iid,[MarshalAs(UnmanagedType.Interface)] out IAccessible a);
  [DllImport("oleacc.dll")] static extern int AccessibleChildren(IAccessible a,int start,int count,[Out,MarshalAs(UnmanagedType.LPArray,SizeParamIndex=2)] object[] children,out int obtained);
  public static AccItem[] ListItems(IntPtr h) {
    Guid iid=new Guid("618736e0-3c3d-11cf-810c-00aa00389b71"); IAccessible a;
    int hr=AccessibleObjectFromWindow(h,0xfffffffc,ref iid,out a);if(hr!=0) Marshal.ThrowExceptionForHR(hr);
    try {
      var children=new object[a.accChildCount];int obtained;
      hr=AccessibleChildren(a,0,children.Length,children,out obtained);if(hr<0) Marshal.ThrowExceptionForHR(hr);
      var items=new AccItem[obtained];
      for(int i=0;i<obtained;i++) {
        var child=children[i] as IAccessible;object id=child==null?children[i]:(object)0;
        var source=child??a;
        try {
          var item=new AccItem();item.id=i+1;item.name=source.get_accName(id);item.state=source.get_accState(id);
          source.accLocation(out item.x,out item.y,out item.width,out item.height,id); items[i]=item;
        } finally {if(child!=null) Marshal.ReleaseComObject(child);}
      }
      return items;
    } finally {Marshal.ReleaseComObject(a);}
  }
  [DllImport("user32.dll",EntryPoint="GetWindowLongPtrW")] public static extern IntPtr GetWindowLongPtr(IntPtr h,int n);
  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h,uint m,IntPtr w,IntPtr l);
  [DllImport("user32.dll",CharSet=CharSet.Unicode,SetLastError=true)] public static extern IntPtr SendMessageTimeout(IntPtr h,uint m,IntPtr w,string l,uint flags,uint time,out IntPtr result);
  public static string Text(IntPtr h) {var s=new StringBuilder(65536);GetWindowText(h,s,s.Capacity);return s.ToString();}
  public static void SetText(IntPtr h,string text) {IntPtr result;if(SendMessageTimeout(h,12,IntPtr.Zero,text,2,3000,out result)==IntPtr.Zero) throw new Exception("WM_SETTEXT timed out; inspect before retrying");if(Text(h)!=text) throw new Exception("Text readback differs");}
  [DllImport("user32.dll")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
  public delegate bool EnumProc(IntPtr h, IntPtr p);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr p);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsChild(IntPtr p, IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] static extern bool AttachThreadInput(uint a,uint b,bool attach);
  [DllImport("user32.dll")] static extern IntPtr SetFocus(IntPtr h);
  [StructLayout(LayoutKind.Sequential)] struct GuiInfo {public uint size,flags;public IntPtr active,focus,capture,menu,move,caret;public int left,top,right,bottom;}
  [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint thread,ref GuiInfo info);
  [DllImport("user32.dll")] static extern IntPtr OpenInputDesktop(uint flags,bool inherit,uint access);
  [DllImport("user32.dll")] static extern IntPtr GetThreadDesktop(uint thread);
  [DllImport("user32.dll")] static extern bool CloseDesktop(IntPtr h);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern bool GetUserObjectInformation(IntPtr h,int index,StringBuilder value,uint length,out uint needed);
  public static void CheckDesktop() {
    var input=OpenInputDesktop(0,false,1);if(input==IntPtr.Zero) throw new Exception("Interactive input desktop is unavailable; unlock the current session");
    try {uint needed;var a=new StringBuilder(256);var b=new StringBuilder(256);
      if(!GetUserObjectInformation(input,2,a,512,out needed)||!GetUserObjectInformation(GetThreadDesktop(GetCurrentThreadId()),2,b,512,out needed)||a.ToString()!=b.ToString()) throw new Exception("Input desktop differs from this session; no input sent");
    } finally {CloseDesktop(input);}
  }
  public static long Focused(IntPtr h) {uint unused;uint thread=GetWindowThreadProcessId(h,out unused);var info=new GuiInfo();info.size=(uint)Marshal.SizeOf(typeof(GuiInfo));if(!GetGUIThreadInfo(thread,ref info)) throw new Exception("Cannot read window focus");return info.focus.ToInt64();}
  public static void Focus(IntPtr h) {
    uint unused;uint thread=GetWindowThreadProcessId(h,out unused);uint current=GetCurrentThreadId();
    bool attached=current!=thread && AttachThreadInput(current,thread,true);
    try {SetFocus(h);if(Focused(h)!=h.ToInt64()) throw new Exception("Control did not accept focus");}
    finally {if(attached) AttachThreadInput(current,thread,false);}
  }
  public static void Foreground(IntPtr h) {
    CheckDesktop();
    ShowWindow(h,9); if(GetForegroundWindow()==h) return;
    if(SetForegroundWindow(h) && GetForegroundWindow()==h) return;
    uint unused;uint foreground=GetWindowThreadProcessId(GetForegroundWindow(),out unused);uint current=GetCurrentThreadId();
    bool attached=foreground!=current && AttachThreadInput(current,foreground,true);
    try {SetForegroundWindow(h);} finally {if(attached) AttachThreadInput(current,foreground,false);}
  }
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h,uint m,IntPtr w,IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct Point {public int x,y;}
  [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(Point p);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
  [StructLayout(LayoutKind.Sequential)] public struct Mouse {public int x,y; public uint data,flags,time; public UIntPtr extra;}
  [StructLayout(LayoutKind.Sequential)] public struct Keyboard {public ushort key,scan; public uint flags,time; public UIntPtr extra;}
  [StructLayout(LayoutKind.Explicit)] public struct Payload {[FieldOffset(0)]public Mouse mouse; [FieldOffset(0)]public Keyboard keyboard;}
  [StructLayout(LayoutKind.Sequential)] public struct Input {public uint type; public Payload payload;}
  [DllImport("user32.dll",SetLastError=true)] static extern uint SendInput(uint count, Input[] input, int size);
  public static void MouseButton(bool right) {
    var a=new Input[2]; a[0].payload.mouse.flags=right?8u:2u; a[1].payload.mouse.flags=right?16u:4u;
    if(SendInput(2,a,Marshal.SizeOf(typeof(Input)))!=2) throw new Exception("SendInput failed; action may be partial");
  }
  public static void Key(ushort k,bool up) {
    var a=new Input[1]; a[0].type=1; a[0].payload.keyboard.key=k; a[0].payload.keyboard.flags=up?2u:0u;
    if(SendInput(1,a,Marshal.SizeOf(typeof(Input)))!=1) throw new Exception("SendInput failed; action may be partial");
  }
}
'@
[void][CmNative]::SetThreadDpiAwarenessContext([IntPtr]::new(-4))
function Check-Client([int]$Number) {
    $p = Get-Process -Id $Number -ErrorAction Stop
    if ([IO.Path]::GetFileName($p.Path) -ine 'CMClient.exe') { throw 'Target process is not CMClient.exe' }
    return $p
}
function Read-Node($Node) {
    $c = $Node.Current
    $rect = $c.BoundingRectangle
    $valueResult = $null
    $pattern = $null
    if ($Node.TryGetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern,[ref]$pattern)) { $valueResult = $pattern.Current.Value }
    $listItems=@();$nativeState=$null
    if ($c.NativeWindowHandle) {
        $h=[IntPtr]$c.NativeWindowHandle
        if ($c.ClassName -eq 'Edit') { $valueResult=[CmNative]::Text($h) }
        if ($c.ClassName -eq 'Button') {
            $style=[CmNative]::GetWindowLongPtr($h,-16).ToInt64()
            if (($style -band 15) -in @(2,3,4,5,6,9)) { $nativeState=@{kind='check';value=[CmNative]::SendMessage($h,240,[IntPtr]::Zero,[IntPtr]::Zero).ToInt64()} }
        }
        if ($c.ClassName -eq 'SysListView32') {
            try {
                foreach($item in [CmNative]::ListItems($h)) { $listItems+=@{id=$item.id;name=$item.name;state=$item.state;bounds=@{x=$item.x;y=$item.y;width=$item.width;height=$item.height}} }
            } catch { $listItems+=@{status='unavailable';error=$_.Exception.Message} }
        }
    }
    $toggle = $null
    $pattern = $null
    if ($Node.TryGetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern,[ref]$pattern)) { $toggle = $pattern.Current.ToggleState.ToString() }
    $parent=[System.Windows.Automation.TreeWalker]::RawViewWalker.GetParent($Node)
    return [ordered]@{
        runtimeId=($Node.GetRuntimeId() -join '.'); name=$c.Name; type=$c.ControlType.ProgrammaticName
        parentRuntimeId=if($null -ne $parent){$parent.GetRuntimeId() -join '.'}else{$null}
        class=$c.ClassName; automationId=$c.AutomationId; hwnd=$c.NativeWindowHandle
        enabled=$c.IsEnabled; offscreen=$c.IsOffscreen; value=$valueResult; toggle=$toggle
        nativeState=$nativeState;items=$listItems
        bounds=@{x=$rect.X;y=$rect.Y;width=$rect.Width;height=$rect.Height}
        patterns=@($Node.GetSupportedPatterns() | ForEach-Object { $_.ProgrammaticName })
    }
}
try {
    if ($Action -eq 'windows') {
        $items = [Collections.Generic.List[object]]::new()
        $clients = @(Get-Process -Name CMClient -ErrorAction SilentlyContinue)
        if ($ClientPid) { $clients = @(Check-Client $ClientPid) }
        $clientIds = @($clients.Id)
        $callback = [CmNative+EnumProc]{param($h,$unused)
            [uint32]$owner=0
            [void][CmNative]::GetWindowThreadProcessId($h,[ref]$owner)
            if ($owner -in $clientIds) {
                $title=[Text.StringBuilder]::new(2048); $class=[Text.StringBuilder]::new(256)
                [void][CmNative]::GetWindowText($h,$title,$title.Capacity)
                [void][CmNative]::GetClassName($h,$class,$class.Capacity)
                if ($title.Length -gt 0 -or [CmNative]::IsWindowVisible($h)) { $items.Add(@{pid=$owner;hwnd=$h.ToInt64();title=$title.ToString();class=$class.ToString();visible=[CmNative]::IsWindowVisible($h)}) }
            }
            return $true
        }
        [void][CmNative]::EnumWindows($callback,[IntPtr]::Zero)
        @{status='observed';windows=@($items.ToArray());processes=@($clients | ForEach-Object {@{pid=$_.Id;executable=$_.Path}})} | ConvertTo-Json -Depth 12 -Compress
        exit 0
    }
    if (!$ClientPid -or !$Window) { throw 'ClientPid and Window from windows output are required' }
    $null = Check-Client $ClientPid
    [uint32]$owner=0
    [void][CmNative]::GetWindowThreadProcessId([IntPtr]$Window,[ref]$owner)
    if ($owner -ne $ClientPid) { throw 'Window no longer belongs to the selected client' }
    $root=[System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$Window)
    if ($Action -eq 'inspect') {
        $nodes=@(Read-Node $root)
        $children=$root.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)
        foreach($node in $children) { $nodes += Read-Node $node }
        @{status='observed';pid=$ClientPid;window=$Window;focusedHwnd=[CmNative]::Focused([IntPtr]$Window);nodes=$nodes} | ConvertTo-Json -Depth 12 -Compress
        exit 0
    }
    $target=$root
    if (!$PSBoundParameters.ContainsKey('WindowTitle') -or $root.Current.Name -cne $WindowTitle) { throw 'WindowTitle from current windows output is required; window may have changed' }
    if ($Action -notin @('show','key','close')) {
        if (!$RuntimeId -or !$PSBoundParameters.ContainsKey('ExpectedName')) { throw 'RuntimeId and ExpectedName from a fresh inspection are required' }
        $matches=@()
        $nodes=$root.FindAll([System.Windows.Automation.TreeScope]::Subtree,[System.Windows.Automation.Condition]::TrueCondition)
        foreach($node in $nodes) { if (($node.GetRuntimeId() -join '.') -eq $RuntimeId) { $matches += $node } }
        if ($matches.Count -ne 1) { throw 'Control is missing or ambiguous; inspect again' }
        $target=$matches[0]
        if ($target.Current.Name -cne $ExpectedName) { throw 'Control name changed; inspect again' }
        if (!$target.Current.IsEnabled) { throw 'Control is disabled' }
    }
    $keyMap=@{Control=17;Shift=16;Alt=18;Enter=13;Escape=27;Tab=9;Space=32;Delete=46;Backspace=8;Up=38;Down=40;Left=37;Right=39;Home=36;End=35}
    for($number=1;$number -le 12;$number++) { $keyMap['F'+$number]=111+$number }
    if ($Action -eq 'key') {
        if (!$Keys -or @($Keys | Where-Object { !$keyMap.ContainsKey($_) -and $_ -notmatch '^[A-Z0-9]$' }).Count) { throw 'Keys require named keys or single uppercase letters/digits' }
    }
    if ($Action -eq 'set-value' -and !$PSBoundParameters.ContainsKey('Value')) { throw 'Value is required, including for empty text' }
    if ($Action -eq 'select-item') {
        if (!$Text -or $target.Current.ClassName -ne 'SysListView32') { throw 'select-item requires an observed SysListView32 control and exact Text' }
        $itemMatches=@((Read-Node $target).items | Where-Object { $_.name -ceq $Text })
        if ($itemMatches.Count -ne 1 -or ($itemMatches[0].state -band 0x18001) -ne 0) { throw 'List item is absent, ambiguous, hidden or disabled' }
        $itemBounds=$itemMatches[0].bounds
    }
    if ($Action -eq 'ribbon') {
        if (!$Text -or !$target.Current.NativeWindowHandle) { throw 'ribbon requires current bar RuntimeId and tab Text' }
        if ($Apply) { [CmNative]::Foreground([IntPtr]$Window) }
        if ([CmNative]::GetForegroundWindow().ToInt64() -ne $Window) { throw 'Ribbon inspection requires this client in foreground' }
        . (Join-Path $PSScriptRoot 'ribbon.ps1')
        $tab=Find-CmRibbonTab $target $Text
        if ($tab.selected) { @{status='observed';selectedTab=$Text;window=$Window} | ConvertTo-Json -Compress;exit 0 }
    }
    if (!$Apply) {
        @{status='preview';action=$Action;pid=$ClientPid;window=$Window;target=(Read-Node $target);value=$Value;keys=$Keys;text=$Text;tab=$tab} | ConvertTo-Json -Depth 12 -Compress
        exit 0
    }
    if ($Action -eq 'close') {
        $pattern=$null
        if ($root.TryGetCurrentPattern([System.Windows.Automation.WindowPattern]::Pattern,[ref]$pattern)) { $pattern.Close() }
        elseif (![CmNative]::PostMessage([IntPtr]$Window,16,[IntPtr]::Zero,[IntPtr]::Zero)) { throw 'Close message failed' }
    } elseif ($Action -eq 'set-value') {
        $pattern=$null
        if ($target.TryGetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern,[ref]$pattern)) {
            if ($pattern.Current.IsReadOnly) { throw 'Control is read-only' }
            $pattern.SetValue($Value)
            if ($pattern.Current.Value -cne $Value) { throw 'Value readback differs; action may be partial' }
        } elseif ($target.Current.ClassName -eq 'Edit') {
            $h=[IntPtr]$target.Current.NativeWindowHandle
            if (([CmNative]::GetWindowLongPtr($h,-16).ToInt64() -band 0x800) -ne 0) { throw 'Edit is read-only' }
            [CmNative]::SetText($h,$Value)
        } else { throw 'Control has no supported text-value interface; no blind typing' }
    } else {
        [CmNative]::Foreground([IntPtr]$Window)
        Start-Sleep -Milliseconds 120
        if ([CmNative]::GetForegroundWindow().ToInt64() -ne $Window) { throw 'Could not focus this window; no input sent. Check interactive desktop/session.' }
        if ($Action -eq 'focus') {
            if (!$target.Current.NativeWindowHandle) { throw 'Control has no native focus handle' }
            [CmNative]::Focus([IntPtr]$target.Current.NativeWindowHandle)
        } elseif ($Action -eq 'key') {
            $pressed=[Collections.Generic.List[uint16]]::new()
            try {
                foreach($key in $Keys) {
                    $vk=if($keyMap.ContainsKey($key)){$keyMap[$key]}else{[int][char]$key}
                    [CmNative]::Key([uint16]$vk,$false); $pressed.Add([uint16]$vk)
                }
            } finally { for($i=$pressed.Count-1;$i -ge 0;$i--) { [CmNative]::Key($pressed[$i],$true) } }
        } elseif ($Action -ne 'show') {
            $pattern=$null
            if ($Action -eq 'click' -and $target.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern,[ref]$pattern)) { $pattern.Invoke() }
            else {
                $rect=if($Action -eq 'select-item'){$itemBounds}elseif($Action -eq 'ribbon'){$tab.bounds}else{$target.Current.BoundingRectangle}
                if ($target.Current.IsOffscreen -or $rect.Width -le 0 -or $rect.Height -le 0) { throw 'Control has no visible bounds' }
                $pt=[CmNative+Point]::new();$pt.x=[int]($rect.X+$rect.Width/2);$pt.y=[int]($rect.Y+$rect.Height/2)
                [void][CmNative]::SetCursorPos($pt.x,$pt.y)
                # wxRibbonButtonBar resolves its hovered button before handling a click.
                Start-Sleep -Milliseconds 100
                if ([CmNative]::GetForegroundWindow().ToInt64() -ne $Window) { throw 'Foreground changed before click; no click sent' }
                $under=[CmNative]::WindowFromPoint($pt)
                if ($under.ToInt64() -ne $Window -and ![CmNative]::IsChild([IntPtr]$Window,$under)) { throw 'Control is occluded; no click sent' }
                [CmNative]::MouseButton($Action -eq 'context')
                if ($Action -eq 'double-click') { Start-Sleep -Milliseconds 80; [CmNative]::MouseButton($false) }
            }
        }
    }
    if ($Action -eq 'ribbon') {
        Start-Sleep -Milliseconds 100
        $selected=@([CmNative]::ListItems([IntPtr]$target.Current.NativeWindowHandle) | Where-Object { $_.name -ceq $Text -and ($_.state -band 0x8000) -eq 0 })
        if ($selected.Count -ne 1) { throw 'Requested ribbon page did not become visible; inspect before another action' }
    }
    @{status='dispatched';action=$Action;pid=$ClientPid;window=$Window;verify='Inspect the resulting state; dispatch is not task completion.'} | ConvertTo-Json -Depth 8 -Compress
} catch {
    [Console]::Error.WriteLine((@{status='error';message=$_.Exception.Message;action=$Action;sideEffects='An applied action may have occurred. Inspect before retrying.'} | ConvertTo-Json -Depth 8 -Compress))
    exit 1
}
