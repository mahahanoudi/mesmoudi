$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot'
$env:Path = "$($env:JAVA_HOME)\bin;$($env:Path)"

Write-Host ">>> Configuration Java 21 appliquee."
java -version

Write-Host ">>> Lancement de API-Gateway (8082)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$env:JAVA_HOME = '$env:JAVA_HOME'; $env:Path = '$env:Path'; cd 'API-Gateway\API-Gateway'; mvn spring-boot:run}"

Write-Host ">>> Lancement de Auth-Service (8081)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {`$env:JAVA_HOME = '$env:JAVA_HOME'; `$env:Path = '$env:Path'; cd 'auth-service\auth-service\auth-service'; mvn spring-boot:run}"

Write-Host ">>> Lancement de Restaurant-Service (8083)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$env:JAVA_HOME = '$env:JAVA_HOME'; $env:Path = '$env:Path'; cd 'restaurant-service'; mvn spring-boot:run}"

Write-Host ">>> Lancement de Tourism-App (3000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'tourism-app\tourism-app'; npm start"

Write-Host "`n>>> Tout est lance ! Verifiez les fenetres."
