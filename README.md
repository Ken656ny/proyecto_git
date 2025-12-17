sistema de alimentacion que permita crear, modificar, consultar y eliminar alimentos y dietas destinados a porcinos dependiendo su etapa de vida, cada etapa de vida requiere unos requerimientos nutricionales los cuales se verana saciados por las dietas

archivo .bat

@echo off
REM -------------------------------
REM Abrir index.html en el navegador
REM -------------------------------
start "" "%~dp0\src\templates\index.html"

REM -------------------------------
REM Activar entorno virtual
REM -------------------------------
call "%~dp0\.venv\Scripts\activate.bat"

REM -------------------------------
REM Navegar a la carpeta src y ejecutar app.py
REM -------------------------------
cd /d "%~dp0\src"
python app.py

REM -------------------------------
REM Mantener la ventana abierta
REM -------------------------------
pause
