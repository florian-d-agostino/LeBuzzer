package LaPlateforme.LeBuzzer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;



@Data
@NoArgsConstructor
@AllArgsConstructor


public class Room {
    private String roomCode;
    private String hostToken;
    private GameStatus gameStatus;
    private List<Player> players;
    private Quiz quiz;
}
