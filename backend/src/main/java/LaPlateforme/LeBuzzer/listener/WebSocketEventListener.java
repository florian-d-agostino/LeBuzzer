package LaPlateforme.LeBuzzer.listener;

import LaPlateforme.LeBuzzer.dto.response.GameEventDto;
import LaPlateforme.LeBuzzer.service.RoomService;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;



@Component
@RequiredArgsConstructor




public class WebSocketEventListener {


    private final RoomService roomService;

    private final SimpMessagingTemplate messagingTemplate;



    // Handle disconnect
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {

        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Read session attributes
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        if (sessionAttributes != null) {

            String roomCode = (String) sessionAttributes.get("roomCode");
            String playerToken = (String) sessionAttributes.get("playerToken");

            if (roomCode != null && playerToken != null) {

                try {

                    // Disconnect player in room
                    roomService.disconnectPlayer(roomCode, playerToken);

                    // Notify room
                    messagingTemplate.convertAndSend(
                            "/topic/room/" + roomCode,
                            new GameEventDto("PLAYER_DISCONNECTED", Map.of("playerToken", playerToken))
                    );

                } catch (Exception ignored) {
                    // Ignore if room already finished
                }

            }

        }

    }

}
