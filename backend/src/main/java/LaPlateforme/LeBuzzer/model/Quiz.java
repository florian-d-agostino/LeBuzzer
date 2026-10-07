package LaPlateforme.LeBuzzer.model;

import java.util.List;

public record Question(
    int id,
    String question,
    List<String> options,
    List<Integer> correctAnswers,
    int durationSeconds
)
{
}
