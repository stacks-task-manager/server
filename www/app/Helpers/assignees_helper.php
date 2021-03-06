<?php

use App\Models\UserModel;

if (!function_exists('tasks_assignees'))
{
    function tasks_assignees($tasksIDs) 
	{
        if (!count($tasksIDs)) {
            return array();
        }

		$userModel = new UserModel();
        $userBuilder = $userModel->builder();
        $usersQuery = $userBuilder->select("users.id, users.email, users.nickname, users.firstName, users.lastName, tasks_assignees.task")
            ->join('tasks_assignees', 'tasks_assignees.user = users.id', 'left')
            ->whereIn('tasks_assignees.task', $tasksIDs)
            ->orderBy('users.firstName', 'ASC')
            ->get();
        return $usersQuery->getResult();
    }
}