<?php

namespace App\Domain\Wallet\Services;

interface PaymentGatewayInterface
{
    public function charge(float $amount, array $details): array;

    public function refund(string $transactionId, ?float $amount = null): array;

    public function getGatewayName(): string;
}
