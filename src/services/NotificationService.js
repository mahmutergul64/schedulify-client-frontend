import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const connectNotifications = (userId, onMessageReceived) => {
  const socket = new SockJS('http://localhost:8080/ws-notify');
  const stompClient = Stomp.over(socket);
  stompClient.connect({}, () => {
    stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
      onMessageReceived(JSON.parse(message.body));
    });
  });
  return stompClient;
};