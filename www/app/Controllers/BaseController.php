<?php
namespace App\Controllers;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 *
 * @package CodeIgniter
 */

use CodeIgniter\Controller;

class BaseController extends Controller
{

	/**
	 * An array of helpers to be loaded automatically upon
	 * class instantiation. These helpers will be available
	 * to all other controllers that extend BaseController.
	 *
	 * @var array
	 */
    protected $helpers = [];

	/**
	 * Constructor.
	 */
	public function initController(\CodeIgniter\HTTP\RequestInterface $request, \CodeIgniter\HTTP\ResponseInterface $response, \Psr\Log\LoggerInterface $logger)
	{
		// Do Not Edit This Line
		parent::initController($request, $response, $logger);

		//--------------------------------------------------------------------
		// Preload any models, libraries, etc, here.
		//--------------------------------------------------------------------
		// E.g.:
		// $this->session = \Config\Services::session();
	}

    public function reply($data = null, $code = 200, $msg = null, $unlock = true) {
        $response = new \stdClass();
        $response->message = $msg;
        $response->code = $code;
        $response->data = $data;

        if ($unlock) {
            $this->unlock();
        }

        return $this->response->setStatusCode($code)->setJSON($response);
    }

    protected function lock() {
        $board = $this->request->board;
        $user = $this->request->user;

        $lockedBy = cache($board->id);

        if ($lockedBy) {
            $this->reply($lockedBy, 423, "WRN-BOARD-LOCKED", false)->send();
            die();
        }

        cache()->save($board->id, $user, 60);
    }

    protected function unlock() {
        $board = $this->request->board;
        if ($board && $board->id) {
            cache()->delete($board->id);
        }
    }
}
