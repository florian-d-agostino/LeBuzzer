package LaPlateforme.LeBuzzer.dto.response;

import java.util.List;



public record QuestionDto(

    int id,

    String question,

    List<String> options,

    int durationSeconds,

    long remainingSeconds

) {}
