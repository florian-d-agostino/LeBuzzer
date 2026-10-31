package LaPlateforme.LeBuzzer.controller;

import LaPlateforme.LeBuzzer.model.Room;
import LaPlateforme.LeBuzzer.model.Player;
import LaPlateforme.LeBuzzer.model.Quiz;
import LaPlateforme.LeBuzzer.model.Question;
import LaPlateforme.LeBuzzer.service.RoomService;
import LaPlateforme.LeBuzzer.service.QuizService;
import LaPlateforme.LeBuzzer.service.GameService;
import LaPlateforme.LeBuzzer.dto.request.CreateRoomRequest;
import LaPlateforme.LeBuzzer.dto.request.JoinRoomRequest;
import LaPlateforme.LeBuzzer.dto.response.CreateRoomResponse;
import LaPlateforme.LeBuzzer.dto.response.JoinRoomResponse;
import LaPlateforme.LeBuzzer.dto.response.RoomStateDto;
import LaPlateforme.LeBuzzer.dto.response.PlayerDto;
import LaPlateforme.LeBuzzer.dto.response.QuestionDto;
import LaPlateforme.LeBuzzer.dto.response.GameEventDto;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")




public class RoomController {


    private final RoomService roomService;

    private final QuizService quizService;

    private final GameService gameService;

    private final SimpMessagingTemplate messagingTemplate;



    // Build snapshot helper
    private RoomStateDto buildRoomStateDto(Room room) {

        // Question DTO
        QuestionDto questionDto = null;
        if (room.getQuiz() != null && !room.getQuiz().questions().isEmpty()) {
            Question currentQ = room.getQuiz().questions().get(room.getCurrentQuestion());
            long elapsedSeconds = (System.currentTimeMillis() - room.getQuestionStartedAt()) / 1000;
            long remaining = Math.max(0, currentQ.durationSeconds() - elapsedSeconds);

            questionDto = new QuestionDto(
                    currentQ.id(),
                    currentQ.question(),
                    currentQ.options(),
                    currentQ.durationSeconds(),
                    remaining
            );
        }

        // Players DTO
        List<PlayerDto> playerDtos = room.getPlayers().stream()
                .map(p -> new PlayerDto(p.getId(), p.getPseudo(), p.getScore(), p.isStateCo()))
                .toList();

        // Total questions
        int totalQuestions = (room.getQuiz() != null) ? room.getQuiz().questions().size() : 0;

        return new RoomStateDto(
                room.getRoomCode(),
                room.getGameStatus(),
                room.getCurrentQuestion(),
                totalQuestions,
                questionDto,
                playerDtos
        );

    }



    // Broadcast event helper
    private void broadcastToRoom(String roomCode, String type, Object payload) {
        messagingTemplate.convertAndSend("/topic/room/" + roomCode, new GameEventDto(type, payload));
    }



    // Get all quizzes
    @GetMapping("/quizzes")
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }



    // Create Room
    @PostMapping("/rooms")
    public ResponseEntity<CreateRoomResponse> createRoom(@RequestBody CreateRoomRequest request) {

        // Create Room
        Room room = roomService.createRoom(request.quizId());

        return ResponseEntity.ok(new CreateRoomResponse(room.getRoomCode(), room.getHostToken()));

    }



    // Join Room
    @PostMapping("/rooms/{roomCode}/join")
    public ResponseEntity<JoinRoomResponse> joinRoom(
            @PathVariable String roomCode,
            @RequestBody JoinRoomRequest request
    ) {

        // Join Room
        Player player = roomService.joinRoom(roomCode, request.pseudo());

        // Notify room
        broadcastToRoom(roomCode, "PLAYER_JOINED", new PlayerDto(
                player.getId(),
                player.getPseudo(),
                player.getScore(),
                player.isStateCo()
        ));

        return ResponseEntity.ok(new JoinRoomResponse(player.getId(), player.getToken(), player.getPseudo()));

    }



    // Get Room State (Snapshot)
    @GetMapping("/rooms/{roomCode}/state")
    public ResponseEntity<RoomStateDto> getRoomState(@PathVariable String roomCode) {

        // Find Room
        Room room = gameService.getRoom(roomCode);

        return ResponseEntity.ok(buildRoomStateDto(room));

    }

}
