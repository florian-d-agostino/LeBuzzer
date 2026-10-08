package LaPlateforme.LeBuzzer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.ArrayList;



@Data
@NoArgsConstructor
@AllArgsConstructor


public class Room {
    private String roomCode;
    private String hostToken;
    private GameStatus gameStatus = GameStatus.LOBBY;
    private List<Player> players = new ArrayList<>();
    private Quiz quiz;
}
