export type ApiResultOk<T> = { ok: true; data: T };
export type ApiResultErr = { ok: false; status: number; message?: string };
export type ApiResult<T> = ApiResultOk<T> | ApiResultErr;

export type AuthUserDto = {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type SignInResponseDto = {
  redirect: boolean;
  token: string;
  user: AuthUserDto;
};

export type SignInPayload = {
  email: string;
  password: string;
  callbackURL?: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
};
