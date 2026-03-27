import { io } from 'socket.io-client';
import logger from '@utils/logger';

export const SOCKET_URL = 'https://backend.biometricpro.app/'; // Replace with actual server URL
// export const SOCKET_URL = 'https://biometric-staging-backend.caprover-testing.mtechub.com/'; // Replace with actual server URL

export const socket = io(SOCKET_URL, {
    transports: ['websocket'],
  });

