@echo off
if not defined JAVA_HOME (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2025.2\jbr" (
        set "JAVA_HOME=C:\Program Files\JetBrains\IntelliJ IDEA 2025.2\jbr"
    )
)
set "MAVEN_BIN=C:\Users\S VISHAL\.m2\wrapper\dists\apache-maven-3.9.11-bin\6mqf5t809d9geo83kj4ttckcbc\apache-maven-3.9.11\bin"
set "PATH=%JAVA_HOME%\bin;%MAVEN_BIN%;%PATH%"
"%MAVEN_BIN%\mvn.cmd" %*

