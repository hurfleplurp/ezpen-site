[CmdletBinding(DefaultParameterSetName = 'Publish')]
param(
    [Parameter(Mandatory, ParameterSetName = 'Publish')]
    [ValidateNotNullOrEmpty()]
    [string]$Message,

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
try {
    $env:GGEZPEN_LEADERBOARD_DATA = $DataDirectory
    $env:GGEZPEN_TICKER_SCRIPT = $ServerScript
    $env:GGEZPEN_TICKER_MESSAGE = $Message
    if ($Clear) {
        $env:GGEZPEN_TICKER_COMMAND = 'clear-announcement'
        $expected = ''
    } else {
        $env:GGEZPEN_TICKER_COMMAND = 'announce'
        $expected = $Message.Trim()
    }
    # Environment transport avoids Windows PowerShell's native-argument quote loss.
    $invoke = "process.argv=[process.execPath,process.env.GGEZPEN_TICKER_SCRIPT,process.env.GGEZPEN_TICKER_COMMAND];if(process.env.GGEZPEN_TICKER_COMMAND==='announce')process.argv.push(process.env.GGEZPEN_TICKER_MESSAGE);import(require('node:url').pathToFileURL(process.argv[1]).href)"
    & $NodePath -e $invoke
    if ($LASTEXITCODE -ne 0) { throw 'Ticker database update failed.' }
    $latest = Invoke-WebRequest 'http://127.0.0.1:8787/v1/latest-version' -UseBasicParsing
    if ($latest.StatusCode -ne 200) { throw 'Cannot verify current latest release.' }
    $noticeUrl = 'http://127.0.0.1:8787/v1/announcements'
    if ($latest.Content) {
        $noticeUrl += '?version=' + [Uri]::EscapeDataString($latest.Content)
    }
    $response = Invoke-WebRequest $noticeUrl -UseBasicParsing
    if ($response.StatusCode -ne 200 -or $response.Headers['Content-Type'] -notlike 'text/plain*' -or $response.Content -cne $expected) {
        throw 'Ticker was written, but live delivery verification failed. Check the backend before retrying.'
    }
    if ($Clear) { 'Ticker cleared and live delivery verified.' }
    else { 'Ticker published and live delivery verified.' }
} finally {
    $env:GGEZPEN_LEADERBOARD_DATA = $previousData
    $env:GGEZPEN_TICKER_SCRIPT = $previousScript
    $env:GGEZPEN_TICKER_COMMAND = $previousCommand
    $env:GGEZPEN_TICKER_MESSAGE = $previousMessage
}
