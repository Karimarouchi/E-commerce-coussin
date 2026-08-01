@echo off
REM Start Spring Boot backend (sets JAVA_HOME if missing)
if "%JAVA_HOME%"=="" (
  if exist "C:\Program Files\Java\jdk-17\bin\java.exe" set "JAVA_HOME=C:\Program Files\Java\jdk-17"
)
if "%JAVA_HOME%"=="" (
  echo JAVA_HOME is not set and JDK 17 was not found in C:\Program Files\Java\jdk-17
  exit /b 1
)
echo Using JAVA_HOME=%JAVA_HOME%
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
