@echo off
title Hospital Bot - Discord
color 0A

echo ============================================
echo       HOSPITAL ONLINE - DISCORD BOT
echo ============================================
echo.

:input_token
set /p DISCORD_BOT_TOKEN="Digite seu Token do Bot (sera usado apenas nesta sessao): "

if "%DISCORD_BOT_TOKEN%"=="" (
    echo [ERRO] Token nao pode estar vazio!
    goto input_token
)

echo.
echo [INFO] Verificando dependencias...
call npm install

echo.
echo [INFO] Iniciando bot...
echo.
set DISCORD_BOT_TOKEN=%DISCORD_BOT_TOKEN%
node bot.js

pause