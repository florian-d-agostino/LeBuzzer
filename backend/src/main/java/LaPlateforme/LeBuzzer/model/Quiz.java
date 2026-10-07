package LaPlateforme.LeBuzzer.model;

import java.util.List;

public record Quiz (
    String id,
    String title,
    String description,
    List<Question> questions
)
{
}
