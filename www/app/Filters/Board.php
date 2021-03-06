<?php namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Config\Services;
use App\Models\BoardModel;

class Board implements FilterInterface
{
    public function before(RequestInterface $request)
    {
        $user = $request->user;
        $response = new \stdClass();
        $response->code = 404;
        $response->data = null;

        $boardModel = new BoardModel();

        $builder = $boardModel->builder();
        $query = $builder->select('boards.*')
            ->join('boards_members', 'boards_members.board = boards.id', 'left')
            ->where('boards.deleted', NULL)
            ->where('boards.id', $request->uri->getSegment(4))
            ->groupStart()
                ->where('boards.owner', $user->id)
                ->orWhere('boards_members.user', $user->id)
                ->orWhere('boards.everyone', 1)
            ->groupEnd()
            ->limit(1)
            ->get();

        $boards = $query->getResult();
        
        if (!count($boards)) {
            $response->message = 'ERR-BOARDS-NOT-FOUND-MSG';
            return Services::response()
                ->setStatusCode(404)
                ->setJSON($response);
        }

        $request->board = $boards[0];
        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response)
    {
        // Do something here
    }
}