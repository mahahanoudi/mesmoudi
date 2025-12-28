# Script d export pour deploiement Proxmox
# Executer ce script dans PowerShell en tant qu administrateur

Write-Host '=== Export des images Docker et du code source ===' -ForegroundColor Green
Write-Host ''

# 1. Export des images Docker
Write-Host '[1/2] Export des images Docker...' -ForegroundColor Yellow

$images = @(
    'mesmoudi-tourism-app',
    'mesmoudi-guide-service',
    'mesmoudi-hotel-service',
    'mesmoudi-api-gateway',
    'mesmoudi-flightservice',
    'mesmoudi-auth-service',
    'mesmoudi-restaurant-service',
    'mysql:8.0',
    'phpmyadmin:latest'
)

docker save -o 'C:\Users\Hp\Desktop\mes-images.tar' $images

if ($LASTEXITCODE -eq 0) {
    Write-Host 'OK Images exportees avec succes !' -ForegroundColor Green
    $imageSize = (Get-Item 'C:\Users\Hp\Desktop\mes-images.tar').Length / 1GB
    Write-Host ('Taille : {0} GB' -f [math]::Round($imageSize, 2)) -ForegroundColor Cyan
}
else {
    Write-Host 'ERREUR lors de l export des images Docker' -ForegroundColor Red
    exit 1
}

Write-Host ''

# 2. Compression du code source
Write-Host '[2/2] Compression du code source...' -ForegroundColor Yellow

$source = 'C:\Users\Hp\Desktop\mesmoudi'
$destination = 'C:\Users\Hp\Desktop\code-source.zip'

$excludePatterns = @('node_modules', 'target', '.git')

if (Test-Path $destination) {
    Remove-Item $destination -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($destination, 'Create')

Get-ChildItem $source -Recurse -File | ForEach-Object {

    foreach ($pattern in $excludePatterns) {
        if ($_.FullName -like "*\$pattern\*") {
            return
        }
    }

    $relativePath = $_.FullName.Substring($source.Length + 1)

    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $archive,
        $_.FullName,
        $relativePath,
        [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
}

$archive.Dispose()

if (Test-Path $destination) {
    $codeSize = (Get-Item $destination).Length / 1MB
    Write-Host 'OK Code source compresse avec succes !' -ForegroundColor Green
    Write-Host ('Taille : {0} MB' -f [math]::Round($codeSize, 2)) -ForegroundColor Cyan
}
else {
    Write-Host 'ERREUR lors de la compression du code source' -ForegroundColor Red
    exit 1
}

Write-Host ''
Write-Host '=== Export termine ===' -ForegroundColor Green
Write-Host ''
Write-Host 'Fichiers crees sur le Bureau :' -ForegroundColor Cyan
Write-Host '1. mes-images.tar (images Docker)'
Write-Host '2. code-source.zip (code source)'
Write-Host ''
Write-Host 'Prochaines etapes :' -ForegroundColor Yellow
Write-Host '1. Copier les fichiers sur une cle USB'
Write-Host '2. Transferer vers la VM Proxmox'
Write-Host '3. Executer les commandes de deploiement'
