package LaPlateforme.LeBuzzer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
@AllArgsConstructor


public class Player {
    private int id;
    private String pseudo;
    private String token;
    private int score = 0;
    private boolean stateCo;
}
