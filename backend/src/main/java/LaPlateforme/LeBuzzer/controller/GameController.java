package LaPlateforme.LeBuzzer.controller;

import LaPlateforme.LeBuzzer.model.Room;
import LaPlateforme.LeBuzzer.model.Player;
import LaPlateforme.LeBuzzer.model.Question;
import LaPlateforme.LeBuzzer.service.GameService;
import LaPlateforme.LeBuzzer.service.RoomService;
import LaPlateforme.LeBuzzer.dto.request.SubmitAnswerRequest;
import LaPlateforme.LeBuzzer.dto.response.QuestionDto;
import LaPlateforme.LeBuzzer.dto.response.PlayerDto;
import LaPlateforme.LeBuzzer.dto.response.GameEventDto;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;



@Controller
@RequiredArgsConstructor




public class GameController {


    private final GameService gameService;

    private final RoomService roomService;

    private final SimpMessagingTemplate messagingTemplate;



    // Broadcast event helper
    private void broadcastToRoom(String roomCode, String type, Object payload) {
        messagingTemplate.convertAndSend("/topic/room/" + roomCode, new GameEventDto(type, payload));
    }



    // Launch Question
    @MessageMapping("/room/{roomCode}/launch")
    public void launchQuestion(
            @DestinationVariable String roomCode,
            @Header("hostToken") String hostToken
    ) {

        // Launch question
        Question question = gameService.launchQuestion(roomCode, hostToken);

        // Safe Question DTO
        QuestionDto questionDto = new QuestionDto(
                question.id(),
                question.question(),
                question.options(),
                question.durationSeconds(),
                question.durationSeconds()
        );

        // Broadcast to room
        broadcastToRoom(roomCode, "QUESTION_STARTED", questionDto);

    }



    // Submit Answer
    @MessageMapping("/room/{roomCode}/submit")
    public void submitAnswer(
            @DestinationVariable String roomCode,
            SubmitAnswerRequest request
    ) {

        // Submit answer
        boolean isCorrect = gameService.submitAnswer(roomCode, request.playerToken(), request.selectedAnswers());

        // Broadcast answer event
        broadcastToRoom(roomCode, "ANSWER_SUBMITTED", Map.of(
                "isCorrect", isCorrect,
                "roomCode", roomCode
        ));

    }



    // Close Question
    @MessageMapping("/room/{roomCode}/close")
    public void closeQuestion(
            @DestinationVariable String roomCode,
            @Header("hostToken") String hostToken
    ) {

        // Close question
        Room room = gameService.closeQuestion(roomCode, hostToken);

        // Leaderboard
        List<PlayerDto> leaderboard = gameService.getLeaderboard(roomCode).stream()
                .map(p -> new PlayerDto(p.getId(), p.getPseudo(), p.getScore(), p.isStateCo()))
                .toList();

        // Current question with answer
        Question currentQ = room.getQuiz().questions().get(room.getCurrentQuestion());

        // Broadcast question closed with answers and leaderboard
        broadcastToRoom(roomCode, "QUESTION_CLOSED", Map.of(
                "correctAnswers", currentQ.correctAnswers(),
                "leaderboard", leaderboard
        ));

    }



    // Next Question
    @MessageMapping("/room/{roomCode}/next")
    public void nextQuestion(
            @DestinationVariable String roomCode,
            @Header("hostToken") String hostToken
    ) {

        // Next question
        Room room = gameService.nextQuestion(roomCode, hostToken);

        // Check status
        if (room.getGameStatus() == LaPlateforme.LeBuzzer.model.GameStatus.GAME_OVER) {

            // Final leaderboard
            List<PlayerDto> finalPodium = gameService.getLeaderboard(roomCode).stream()
                    .map(p -> new PlayerDto(p.getId(), p.getPseudo(), p.getScore(), p.isStateCo()))
                    .toList();

            broadcastToRoom(roomCode, "GAME_OVER", finalPodium);

        } else {

            // Question DTO
            Question nextQ = room.getQuiz().questions().get(room.getCurrentQuestion());
            QuestionDto questionDto = new QuestionDto(
                    nextQ.id(),
                    nextQ.question(),
                    nextQ.options(),
                    nextQ.durationSeconds(),
                    nextQ.durationSeconds()
            );

            broadcastToRoom(roomCode, "QUESTION_STARTED", questionDto);

        }

    }



    // Reconnect Player
    @MessageMapping("/room/{roomCode}/reconnect")
    public void reconnectPlayer(
            @DestinationVariable String roomCode,
            Map<String, String> payload
    ) {

        String playerToken = payload.get("playerToken");

        // Reconnect player
        Player player = roomService.reconnectPlayer(roomCode, playerToken);

        // Broadcast player back online
        broadcastToRoom(roomCode, "PLAYER_RECONNECTED", new PlayerDto(
                player.getId(),
                player.getPseudo(),
                player.getScore(),
                player.isStateCo()
        ));

    }

}
