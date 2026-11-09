[CmdletBinding(DefaultParameterSetName = 'Publish')]
param(
    [Parameter(Mandatory, ParameterSetName = 'Publish')]
    [ValidateNotNullOrEmpty()]
    [string]$Message,
    [Parameter(ParameterSetName = 'Publish')]
    [string]$MaxVersion,

    [Parameter(Mandatory, ParameterSetName = 'Clear')]
    [switch]$Clear,

    [string]$NodePath = 'C:\Sites\ggezpen-leaderboard\runtime\node.exe',
    [string]$ServerScript = 'C:\Sites\ggezpen-leaderboard\releases\20261108-01\Leaderboard\server.mjs',
    [string]$DataDirectory = 'C:\Sites\ggezpen-leaderboard\data'
)

$ErrorActionPreference = 'Stop'
if (-not $Clear -and ($Message.Length -gt 512 -or $Message -match '[^\x20-\x7e]' -or -not $Message.Trim())) {
    throw 'Ticker messages must contain 1-512 printable ASCII characters. Use -Clear to remove a notice.'
}
foreach ($path in $NodePath, $ServerScript, (Join-Path $DataDirectory 'leaderboard.sqlite')) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Required ticker backend file not found: $path"
    }
}
$previousData = $env:GGEZPEN_LEADERBOARD_DATA
$previousScript = $env:GGEZPEN_TICKER_SCRIPT
$previousCommand = $env:GGEZPEN_TICKER_COMMAND
$previousMessage = $env:GGEZPEN_TICKER_MESSAGE
$previousMaximum = $env:GGEZPEN_TICKER_MAXIMUM
try {
    $env:GGEZPEN_LEADERBOARD_DATA = $DataDirectory
    $env:GGEZPEN_TICKER_SCRIPT = $ServerScript
    $env:GGEZPEN_TICKER_MESSAGE = $Message
    $env:GGEZPEN_TICKER_MAXIMUM = $MaxVersion
    if ($Clear) {
        $env:GGEZPEN_TICKER_COMMAND = 'clear-announcement'
        $expected = ''
    } else {
        $env:GGEZPEN_TICKER_COMMAND = 'announce'
        $expected = $Message.Trim()
    }
    # Environment transport avoids Windows PowerShell's native-argument quote loss.
    $invoke = "process.argv=[process.execPath,process.env.GGEZPEN_TICKER_SCRIPT,process.env.GGEZPEN_TICKER_COMMAND];if(process.env.GGEZPEN_TICKER_COMMAND==='announce'){process.argv.push(process.env.GGEZPEN_TICKER_MESSAGE);if(process.env.GGEZPEN_TICKER_MAXIMUM)process.argv.push(process.env.GGEZPEN_TICKER_MAXIMUM)}import(require('node:url').pathToFileURL(process.argv[1]).href)"
    & $NodePath -e $invoke
    if ($LASTEXITCODE -ne 0) { throw 'Ticker database update failed.' }
    $response = Invoke-WebRequest 'http://127.0.0.1:8787/v1/announcements.rss' -UseBasicParsing
    if ($response.StatusCode -ne 200 -or $response.Headers['Content-Type'] -notlike 'application/rss+xml*') {
        throw 'Cannot verify public RSS feed.'
    }
    $settings = [Xml.XmlReaderSettings]::new()
    $settings.DtdProcessing = [Xml.DtdProcessing]::Prohibit
    $settings.XmlResolver = $null
    $reader = [Xml.XmlReader]::Create([IO.StringReader]::new($response.Content),$settings)
    $feed = [Xml.XmlDocument]::new()
    try { $feed.Load($reader) } finally { $reader.Dispose() }
    $notice = @($feed.rss.channel.item | Where-Object { $_.title -eq 'ggezPen notice' })
    $target = if ($MaxVersion) { $MaxVersion } else { '*' }
    if (($Clear -and $notice.Count -ne 0) -or
        (-not $Clear -and ($notice.Count -ne 1 -or $notice[0].description -cne $expected -or
            $notice[0].GetElementsByTagName('maxVersion','urn:ggezpen:notices:v1')[0].InnerText -cne $target))) {
        throw 'Ticker was written, but live delivery verification failed. Check the backend before retrying.'
    }
    if ($Clear) { 'Ticker cleared and live delivery verified.' }
    else { 'Ticker published and live delivery verified.' }
} finally {
    $env:GGEZPEN_LEADERBOARD_DATA = $previousData
    $env:GGEZPEN_TICKER_SCRIPT = $previousScript
    $env:GGEZPEN_TICKER_COMMAND = $previousCommand
    $env:GGEZPEN_TICKER_MESSAGE = $previousMessage
    $env:GGEZPEN_TICKER_MAXIMUM = $previousMaximum
}
