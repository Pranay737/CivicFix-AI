@echo off
if not defined JAVA_HOME (
    if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
    )
)

set "MVN_EXEC=C:\Users\harik\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd"
if not exist "%MVN_EXEC%" (
    for /f "delims=" %%I in ('dir /b /s "%USERPROFILE%\.m2\wrapper\dists\mvn.cmd" 2^>nul') do (
        set "MVN_EXEC=%%I"
        goto :found
    )
)
:found
"%MVN_EXEC%" %*
