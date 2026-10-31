package LaPlateforme.LeBuzzer.dto.request;

import java.util.List;



public record SubmitAnswerRequest(

    String playerToken,

    List<Integer> selectedAnswers

) {}
