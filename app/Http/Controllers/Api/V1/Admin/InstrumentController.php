<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Instrument\Models\Instrument;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\InstrumentRequest;
use App\Http\Responses\ApiResponse;

class InstrumentController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(data: Instrument::paginate(20));
    }

    public function store(InstrumentRequest $request)
    {
        $instrument = Instrument::create($request->validated());

        return $this->created(
            data: $instrument,
            message: 'Instrument created.'
        );
    }

    public function show(Instrument $instrument)
    {
        return $this->success(data: $instrument);
    }

    public function update(InstrumentRequest $request, Instrument $instrument)
    {
        $instrument->update($request->validated());

        return $this->success(
            data: $instrument,
            message: 'Instrument updated.'
        );
    }

    public function destroy(Instrument $instrument)
    {
        $instrument->delete();

        return $this->success(message: 'Instrument deleted.');
    }
}
