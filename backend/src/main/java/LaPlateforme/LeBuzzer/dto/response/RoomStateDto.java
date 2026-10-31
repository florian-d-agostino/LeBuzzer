package LaPlateforme.LeBuzzer.dto.response;

import LaPlateforme.LeBuzzer.model.GameStatus;
import java.util.List;



public record RoomStateDto(

    String roomCode,

    GameStatus gameStatus,

    int currentQuestionIndex,

    int totalQuestions,

    QuestionDto currentQuestion,

    List<PlayerDto> players

) {}
