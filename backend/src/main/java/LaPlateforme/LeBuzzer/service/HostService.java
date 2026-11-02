package LaPlateforme.LeBuzzer.service;

import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import LaPlateforme.LeBuzzer.model.GameStatus;
import LaPlateforme.LeBuzzer.model.Room;
import LaPlateforme.LeBuzzer.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor




public class HostService {


    // Grace delay before host left
    public static final long HOST_TIMEOUT_SECONDS = 10;


    private final RoomRepository roomRepository;

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();



    // Find Room method
    private Room getRoomOrThrow(String roomCode) {
        return roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }



    // Check Host method
    private void checkHost(Room room, String hostToken) {
        if (!room.getHostToken().equals(hostToken)) {
            throw new RuntimeException("Error you are not the host");
        }
    }



    // Connect Host
    public Room connectHost(String roomCode, String hostToken, String sessionId) {


        // Find Room
        Room room = getRoomOrThrow(roomCode);


        // Check Host
        checkHost(room, hostToken);


        // Host online
        room.setHostConnected(true);
        room.setHostSessionId(sessionId);


        // Save room
        roomRepository.save(room);

        return room;

    }



    // Disconnect Host
    public Optional<Room> disconnectHost(String roomCode, String sessionId) {


        // Find Room
        Room room = getRoomOrThrow(roomCode);


        // Ignore old session
        if (!sessionId.equals(room.getHostSessionId())) {
            return Optional.empty();
        }


        // Host offline
        room.setHostConnected(false);


        // Save room
        roomRepository.save(room);

        return Optional.of(room);

    }



    // Host leaves
    public Room leaveHost(String roomCode, String hostToken) {


        // Find Room
        Room room = getRoomOrThrow(roomCode);


        // Check Host
        checkHost(room, hostToken);


        // End room
        room.setHostConnected(false);
        room.setGameStatus(GameStatus.HOST_LEFT);


        // Save room
        roomRepository.save(room);

        return room;

    }



    // Schedule host timeout
    public void scheduleHostTimeout(String roomCode, Runnable onHostLeft) {

        scheduler.schedule(() -> {

            Room room = roomRepository.findByRoomCode(roomCode).orElse(null);


            // Host came back
            if (room == null || room.isHostConnected()) {
                return;
            }


            // Game already finished
            if (room.getGameStatus() == GameStatus.GAME_OVER || room.getGameStatus() == GameStatus.HOST_LEFT) {
                return;
            }


            // End room
            room.setGameStatus(GameStatus.HOST_LEFT);
            roomRepository.save(room);

            onHostLeft.run();

        }, HOST_TIMEOUT_SECONDS, TimeUnit.SECONDS);

    }

}
