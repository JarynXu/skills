# Text anchors for the otherwise inaccessible wxRibbon tab strip.
function Get-CmRibbonWords($Bounds) {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime,System.Drawing
    $null=[Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
    $null=[Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]
    $null=[Windows.Storage.Streams.DataWriter,Windows.Foundation,ContentType=WindowsRuntime]
    $null=[Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Foundation,ContentType=WindowsRuntime]
    $method=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {$_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'} | Select-Object -First 1
    function Wait-CmRibbon($Operation,[Type]$Type) {
        $task=$method.MakeGenericMethod($Type).Invoke($null,@($Operation))
        if (!$task.Wait(10000)) { throw 'Windows OCR timed out' }
        return $task.GetAwaiter().GetResult()
    }
    $engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    if (!$engine) { throw 'Windows OCR language pack is unavailable; no tab click sent' }
    $bitmap=$null;$graphics=$null;$large=$null;$draw=$null;$memory=$null;$stream=$null;$writer=$null;$software=$null
    try {
        $bitmap=[Drawing.Bitmap]::new([int]$Bounds.width,[int]$Bounds.height,[Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $graphics=[Drawing.Graphics]::FromImage($bitmap)
        $graphics.CopyFromScreen([int]$Bounds.x,[int]$Bounds.y,0,0,$bitmap.Size)
        $scale=[Math]::Min(3.0,[Windows.Media.Ocr.OcrEngine]::MaxImageDimension/$bitmap.Width)
        $large=[Drawing.Bitmap]::new([int]($bitmap.Width*$scale),[int]($bitmap.Height*$scale),[Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $draw=[Drawing.Graphics]::FromImage($large);$draw.DrawImage($bitmap,0,0,$large.Width,$large.Height)
        $memory=[IO.MemoryStream]::new();$large.Save($memory,[Drawing.Imaging.ImageFormat]::Png)
        $stream=[Windows.Storage.Streams.InMemoryRandomAccessStream]::new();$writer=[Windows.Storage.Streams.DataWriter]::new($stream)
        $writer.WriteBytes($memory.ToArray());$null=Wait-CmRibbon ($writer.StoreAsync()) ([uint32]);$null=$writer.DetachStream();$writer.Dispose();$writer=$null;$stream.Seek(0)
        $decoder=Wait-CmRibbon ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
        $software=Wait-CmRibbon ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
        $result=Wait-CmRibbon ($engine.RecognizeAsync($software)) ([Windows.Media.Ocr.OcrResult])
        $lines=@()
        foreach($line in $result.Lines) {
            $words=@()
            foreach($word in $line.Words) { $b=$word.BoundingRect;$words+=@{text=$word.Text;x=$Bounds.x+$b.x/$scale;y=$Bounds.y+$b.y/$scale;width=$b.width/$scale;height=$b.height/$scale} }
            $lines+=@{text=$line.Text;words=$words}
        }
        return $lines
    } finally { foreach($resource in @($software,$writer,$stream,$memory,$draw,$large,$graphics,$bitmap)) {if($null -ne $resource){$resource.Dispose()}} }
}

function Find-CmRibbonTab($Target,[string]$Caption) {
    $tabs=@([CmNative]::ListItems([IntPtr]$Target.Current.NativeWindowHandle) | Where-Object {$_.name -and $_.name -ne 'control'})
    $desired=@($tabs | Where-Object {$_.name -ceq $Caption})
    if ($desired.Count -ne 1) { throw 'Tab caption is absent or ambiguous' }
    if (($desired[0].state -band 0x8000) -eq 0) { return @{selected=$true;caption=$Caption} }
    $rect=$Target.Current.BoundingRectangle
    $height=($tabs | Measure-Object -Property y -Minimum).Minimum-$rect.y
    if ($height -lt 12 -or $height -gt 60) { throw 'Ribbon header geometry differs from supported wxRibbon layout' }
    $lines=Get-CmRibbonWords @{x=$rect.x;y=$rect.y;width=$rect.width;height=$height}
    $anchors=@()
    for($index=0;$index -lt $tabs.Count;$index++) {
        $captionText=$tabs[$index].name -replace '\s',''
        foreach($line in $lines) { for($start=0;$start -lt $line.words.Count;$start++) {
            $text=''
            for($end=$start;$end -lt $line.words.Count;$end++) {
                $text+=($line.words[$end].text -replace '\s','')
                if ($text -ceq $captionText) {
                    $a=$line.words[$start];$b=$line.words[$end]
                    $anchors+=@{index=$index;caption=$tabs[$index].name;x=($a.x+$b.x+$b.width)/2;y=$a.y+$a.height/2}
                }
                if ($text.Length -ge $captionText.Length) { break }
            }
        } }
    }
    $anchors=@($anchors | Sort-Object index)
    if ($anchors.Count -lt 2 -or @($anchors.index | Select-Object -Unique).Count -ne $anchors.Count) { throw 'Tab anchors are missing or ambiguous; no tab click sent' }
    $first=$anchors[0];$last=$anchors[-1]
    $pitch=($last.x-$first.x)/($last.index-$first.index);$origin=$first.x-$first.index*$pitch
    if ($pitch -lt 35 -or $pitch -gt 180) { throw 'Tab spacing is outside the supported layout' }
    foreach($a in $anchors) { if ([Math]::Abs($a.x-($origin+$a.index*$pitch)) -gt 5 -or [Math]::Abs($a.y-$first.y) -gt 5) { throw 'Tabs do not have the supported uniform layout' } }
    $desiredIndex=[Array]::IndexOf($tabs,$desired[0]);$x=$origin+$desiredIndex*$pitch
    if ($x -le $rect.x -or $x -ge $rect.Right -or $first.y -le $rect.y -or $first.y -ge $rect.y+$height) { throw 'Computed tab location is outside this header' }
    return @{selected=$false;caption=$Caption;anchors=$anchors;bounds=@{x=$x-1;y=$first.y-1;width=2;height=2}}
}
