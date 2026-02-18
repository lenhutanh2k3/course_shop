<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role ?? 'user', // Mặc định là user
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'user'  => new UserResource($user),
        ], 'Đăng ký tài khoản thành công!', 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        // Kiểm tra mật khẩu
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return $this->errorResponse('Thông tin đăng nhập không chính xác', null, 401);
        }

        $remember = $request->boolean('remember', false);
        $token    = $user->createToken('auth-token')->plainTextToken;

        return $this->successResponse([
            'token'    => $token,
            'remember' => $remember,
            'user'     => new UserResource($user),
        ], 'Đăng nhập thành công!');
    }

    public function me(Request $request)
    {
        return $this->successResponse(
            new UserResource($request->user()), 
            'Lấy thông tin người dùng thành công'
        );
    }

    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
            
            return $this->successResponse(null, 'Đăng xuất thành công!');
        }

        return $this->errorResponse('Không tìm thấy người dùng để đăng xuất', null, 401);
    }
}