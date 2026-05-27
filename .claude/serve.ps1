$port = 5500
$root = Split-Path $PSScriptRoot -Parent

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server: http://localhost:$port"

while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $urlPath = $ctx.Request.Url.LocalPath
        $localPath = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        if ($localPath -eq '' -or $localPath -eq '\') { $localPath = 'demo.html' }
        $file = Join-Path $root $localPath

        if ((Test-Path $file) -and -not (Get-Item $file).PSIsContainer) {
            $ext = [System.IO.Path]::GetExtension($file).ToLower()
            $mime = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.svg'  { 'image/svg+xml' }
                '.png'  { 'image/png' }
                '.jpg'  { 'image/jpeg' }
                '.webp' { 'image/webp' }
                default { 'application/octet-stream' }
            }
            $bytes = [System.IO.File]::ReadAllBytes($file)
            $ctx.Response.StatusCode = 200
            $ctx.Response.ContentType = $mime
            $ctx.Response.ContentLength64 = $bytes.Length
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $ctx.Response.StatusCode = 404
            $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
            $ctx.Response.ContentLength64 = $body.Length
            $ctx.Response.OutputStream.Write($body, 0, $body.Length)
        }
        $ctx.Response.Close()
    } catch [System.Net.HttpListenerException] {
        # listener stopped
        break
    } catch {
        try { $ctx.Response.Close() } catch {}
    }
}
