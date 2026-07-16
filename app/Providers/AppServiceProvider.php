<?php

namespace App\Providers;

use App\Domain\Wallet\Services\PaymentGatewayInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind the Payment Gateway Interface to a concrete implementation.
        // Swap the implementation here when switching to Stripe, PayPal, etc.
        $this->app->bind(PaymentGatewayInterface::class, function () {
            // For now, we use a local wallet-based payment system.
            // Replace with StripePaymentGateway::class or PayPalPaymentGateway::class.
            throw new \RuntimeException(
                'No payment gateway implementation bound. ' .
                'Bind a concrete implementation in AppServiceProvider, e.g.: ' .
                '\n  $this->app->bind(PaymentGatewayInterface::class, StripePaymentGateway::class);'
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
