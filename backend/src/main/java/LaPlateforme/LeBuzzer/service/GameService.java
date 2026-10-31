package LaPlateforme.LeBuzzer.service;

import LaPlateforme.LeBuzzer.model.Room;
import LaPlateforme.LeBuzzer.model.Player;
import LaPlateforme.LeBuzzer.model.Question;
import LaPlateforme.LeBuzzer.model.GameStatus;
import LaPlateforme.LeBuzzer.repositories.RoomRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.HashSet;



@RequiredArgsConstructor
@Service




public class GameService {


    private final RoomRepository roomRepository;



    // Find Room method
    private Room getRoomOrThrow(String roomCode) {
        return roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }



    // Find Player method
    private Player getPlayerOrThrow(Room room, String playerToken) {
        return room.getPlayers().stream()
                .filter(p -> p.getToken().equals(playerToken))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Player not found"));
    }



    // Launch Question
    public Question launchQuestion (String roomCode, String hostToken) {


        // Find Room
        Room room = getRoomOrThrow(roomCode);


        // Check Host
        if (!room.getHostToken().equals(hostToken)) {
            throw new RuntimeException("Error you are not the host");
        }


        // Current question
        Question question = room.getQuiz().questions().get(room.getCurrentQuestion());


        // Update Room
        room.setGameStatus(GameStatus.ACTIVE_QUESTION);
        room.getAnsweredPlayerTokens().clear();
        room.setQuestionStartedAt(System.currentTimeMillis());


        // Save room
        roomRepository.save(room);

        return question;

    }



    // Submit an Answer
    public boolean submitAnswer (String roomCode, String playerToken, List<Integer> selectedAnswers) {


        // Find Room
        Room room = getRoomOrThrow(roomCode);


        // Status ACTIVE_QUESTION
        if (room.getGameStatus() != GameStatus.ACTIVE_QUESTION) {
            throw new RuntimeException("Game is not ready");
        }


        // Find Player
        Player player = getPlayerOrThrow(room, playerToken);


        // Check if already answered
        if (room.getAnsweredPlayerTokens().contains(playerToken)) {
            return false;
        }


        // Mark as answered
        room.getAnsweredPlayerTokens().add(playerToken);


        // Current question
        Question question = room.getQuiz().questions().get(room.getCurrentQuestion());


        // Check answer
        boolean isCorrect = selectedAnswers != null
                && !selectedAnswers.isEmpty()
                && new HashSet<>(selectedAnswers).equals(new HashSet<>(question.correctAnswers()));


        // Update score
        if (isCorrect) {
            player.setScore(player.getScore() + 10);
        }


        // Save room
        roomRepository.save(room);

        return isCorrect;

    }



    // Close Question
    public Room closeQuestion (String roomCode, String hostToken) {


        // Find Room
        Room room = getRoomOrThrow(roomCode);


        // Check Host
        if (!room.getHostToken().equals(hostToken)) {
            throw new RuntimeException("Error you are not the host");
        }


        // Update Status
        room.setGameStatus(GameStatus.RESULT_QUESTION);


        // Save room
        roomRepository.save(room);

        return room;

    }



    // Next Question
    public Room nextQuestion (String roomCode, String hostToken) {


        // Find Room
        Room room = getRoomOrThrow(roomCode);


        // Check Host
        if (!room.getHostToken().equals(hostToken)) {
            throw new RuntimeException("Error you are not the host");
        }


        // Next index
        int nextIndex = room.getCurrentQuestion() + 1;


        // Check if finished
        if (nextIndex >= room.getQuiz().questions().size()) {
            room.setGameStatus(GameStatus.GAME_OVER);
        } else {
            room.setCurrentQuestion(nextIndex);
            room.setGameStatus(GameStatus.ACTIVE_QUESTION);
            room.getAnsweredPlayerTokens().clear();
            room.setQuestionStartedAt(System.currentTimeMillis());
        }


        // Save room
        roomRepository.save(room);

        return room;

    }



    // Get Leaderboard
    public List<Player> getLeaderboard (String roomCode) {


        // Find Room
        Room room = getRoomOrThrow(roomCode);


        // Sort players by score
        return room.getPlayers().stream()
                .sorted((p1, p2) -> Integer.compare(p2.getScore(), p1.getScore()))
                .toList();

    }



    // Get Room
    public Room getRoom (String roomCode) {
        return getRoomOrThrow(roomCode);
    }

}