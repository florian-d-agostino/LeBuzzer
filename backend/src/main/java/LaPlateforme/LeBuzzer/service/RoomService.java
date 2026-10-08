package LaPlateforme.LeBuzzer.service;



import org.springframework.stereotype.Service;
import LaPlateforme.LeBuzzer.repositories.RoomRepository;
import LaPlateforme.LeBuzzer.model.Room;
import LaPlateforme.LeBuzzer.model.Player;


import lombok.RequiredArgsConstructor;
import java.util.UUID;
import java.util.Random;





@Service
@RequiredArgsConstructor



public class RoomService {

    private final RoomRepository roomRepository;



    // Generate random code with 5 chars+int
    private String generateRoomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
        StringBuilder code = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 5; i++) {
            int codeRoom = random.nextInt(characters.length());
            code.append(characters.charAt(codeRoom));
    
        }
        return code.toString();
    }



    // Check room code
    public Room createRoom() {
        String roomCode = generateRoomCode();
        while(roomRepository.roomCodeExists(roomCode)) {
            roomCode = generateRoomCode();
        }


        // Token Host
        String hostToken = UUID.randomUUID().toString();


        // Create New Room
        Room room = new Room();
        room.setRoomCode(roomCode);
        room.setHostToken(hostToken);

        roomRepository.save(room);

        return room;

    }







    // Join Room
    public Player joinRoom(String roomCode, String pseudo) {



        // Find room
        Room room = roomRepository.findByRoomCode(roomCode).orElseThrow(() -> new RuntimeException("Room not found"));


        // Check pseudo
        if (pseudo == null || pseudo.isBlank() || pseudo.length() > 12) {
            throw new RuntimeException(pseudo + "Is invalid. Pseudo must be between 1 and 12 characters.");
        }


        // If pseudo already taken
        for (Player existing : room.getPlayers()) {
            if (existing.getPseudo().equalsIgnoreCase(pseudo)) {
                throw new RuntimeException("Pseudo already taken");
            }
        }


        // Add new pLayer
        Player player = new Player();
        player.setId(room.getPlayers().size() + 1);
        player.setPseudo(pseudo);
        player.setToken(UUID.randomUUID().toString());
        player.setStateCo(true);
        


        // Add Player
        room.getPlayers().add(player);
        roomRepository.save(room);


        return player;
    }




    // CONNECT PLAYER //


    // Connect Player
    public Player reconnectPlayer(String roomCode, String playerToken) {

        // Find room
        Room room = roomRepository
        .findByRoomCode(roomCode)
        .orElseThrow(() -> new RuntimeException("Room not found"));



        // Find player token
        Player foundPlayer = null;
        for (Player p : room.getPlayers()) {
            if (p.getToken().equals(playerToken)) {
                foundPlayer = p;
                break;
            }
        }
        if (foundPlayer == null) {
            throw new RuntimeException("Player not found");
        }
        
        // Reconnect player
        foundPlayer.setStateCo(true);
        roomRepository.save(room);

        return foundPlayer;
    }


    // Disconnect Player
    public void disconnectPlayer(String roomCode, String playerToken) {
            Room room = roomRepository.findByRoomCode(roomCode).orElseThrow(() -> new RuntimeException("Room not found"));
            Player foundPlayer = null;
            for (Player p : room.getPlayers()) {
                if (p.getToken().equals(playerToken)) {
                    foundPlayer = p;
                    break;
                }
            }
            if (foundPlayer == null) {
                throw new RuntimeException("Player not found");
            }

            foundPlayer.setStateCo(false);
            roomRepository.save(room);
        }
}