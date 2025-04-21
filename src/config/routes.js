export const ROUTES = {
  HOME: '/',
  LOGIN: '/',
  REGISTER: '/register',
  RECOVER_PASSWORD: '/recover-password',
  RESET_PASSWORD: '/reset-password/:uidb64/:token',
  MAP: '/map',
  CAR_VIEW: '/car-view',
  SETTINGS: '/settings',
  EDIT_PROFILE: '/edit-profile',
  CHANGE_PASSWORD: '/change-password',
  TEST_AUDIO: '/test_audio',
};

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.RECOVER_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

export const PRIVATE_ROUTES = [
  ROUTES.MAP,
  ROUTES.CAR_VIEW,
  ROUTES.SETTINGS,
  ROUTES.EDIT_PROFILE,
  ROUTES.CHANGE_PASSWORD,
  ROUTES.TEST,
  ROUTES.TEST_AUDIO,
]; 