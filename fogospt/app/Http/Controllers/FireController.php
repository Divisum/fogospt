<?php

namespace App\Http\Controllers;

use App\Libs\LegacyApi;

class FireController extends Controller
{
    public function get($id)
    {
        if (!$id) {
            return view('index');
        }

        $fire = $this->getFireById($id);
        $risk = LegacyApi::getRiskByFire($id);
        $status = LegacyApi::getStatusByFire($id);
        $fire['data']['risk'] = $risk['data'][0]['hoje'];
        $fire['data']['status'] = $status['data'];

        return view('index', array('fire' => $fire['data']));
    }

    public function getGeneralCard($id)
    {
        $fire = $this->getFireById($id);
        $risk = LegacyApi::getRiskByFire($id);
        $fire['data']['risk'] = $risk['data'][0]['hoje'];

        return view('elements.risk', array('fire' => $fire['data']));
    }

    public function getStatusCard($id)
    {
        $fire = $this->getFireById($id);
        $status = LegacyApi::getStatusByFire($id);
        $fire['data']['status'] = $status['data'];

        return view('elements.status', array('fire' => $fire['data']));
    }

    private function getFireById($id)
    {
        return LegacyApi::getFire($id);
    }
}
