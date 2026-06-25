<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\Admin\InstrumentRequest;
use App\Models\Instrument;
class InstrumentController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Instrument::all()]);
    }

    public function store(InstrumentRequest $request)
    {
        $instrument = Instrument::create($request->validated());
        return response()->json(['message' => 'Instrument created', 'data' => $instrument], 201);
    }

    public function update(InstrumentRequest $request, Instrument $instrument)
    {
        $instrument->update($request->validated());
        return response()->json(['message' => 'Instrument updated', 'data' => $instrument]);
    }

    public function destroy(Instrument $instrument)
    {
        $instrument->delete();
        return response()->json(['message' => 'Instrument deleted']);
    }
}
