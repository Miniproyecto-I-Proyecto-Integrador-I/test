@echo off
rem Cambia al directorio donde está este script (raíz del proyecto)
pushd "%~dp0"

rem Inicia el servidor Django en una ventana nueva (ruta relativa a la raíz)
start "Django Server" cmd /k "cd backend && python manage.py runserver"

rem Inicia el servidor de desarrollo del frontend en una ventana nueva (ruta relativa a la raíz)
start "Frontend Dev" cmd /k "cd frontend && npm run dev"

rem Vuelve al directorio original
popd
exit /b 0
