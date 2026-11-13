param([string]$m = "Update site")

$ErrorActionPreference = "Stop"

git add .
if ($LASTEXITCODE -ne 0) {
    throw "git add failed."
}

git commit -m $m
if ($LASTEXITCODE -ne 0) {
    throw "git commit failed."
}

git push
if ($LASTEXITCODE -ne 0) {
    throw "git push failed."
}
