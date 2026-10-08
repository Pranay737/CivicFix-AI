@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
set "PATH=%JAVA_HOME%\bin;C:\Users\harik\.tools\apache-maven-3.9.9\bin;%PATH%"
"C:\Users\harik\.tools\apache-maven-3.9.9\bin\mvn.cmd" %*
