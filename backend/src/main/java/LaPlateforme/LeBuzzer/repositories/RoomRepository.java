package LaPlateforme.LeBuzzer.repositories;

import org.springframework.stereotype.Repository;


import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import LaPlateforme.LeBuzzer.model.Room;


@Repository



// CRUD
public class RoomRepository {

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();


    // Save
    public void save(Room room) {
        rooms.put(room.getRoomCode(), room);
    }


    // Find
    public Optional<Room> findByRoomCode(String roomCode) {
        return Optional.ofNullable(rooms.get(roomCode));
    }


    // Remove
    public void removeByRoomCode(String roomCode) {
        rooms.remove(roomCode);
    }


    // Exists
    public boolean roomCodeExists(String roomCode) {
        return rooms.containsKey(roomCode);
    }
}


