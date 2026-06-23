<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->name('api.v1.')
    ->group(function () {
        // اینجا بعداً همه روت‌های نسخه ۱ را اضافه می‌کنیم
    });
