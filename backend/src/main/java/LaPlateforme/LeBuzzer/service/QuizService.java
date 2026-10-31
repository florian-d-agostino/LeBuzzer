package LaPlateforme.LeBuzzer.service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import LaPlateforme.LeBuzzer.model.Quiz;
import jakarta.annotation.PostConstruct;



@Service
public class QuizService {

    private List<Quiz> quizzes = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();



    @PostConstruct


    public void loadQuizzes() {


        try {
            InputStream inputStream = new ClassPathResource("Question/quizz.json").getInputStream();

            this.quizzes = objectMapper.readValue

            (inputStream, new TypeReference<List<Quiz>>() {});
            System.out.println(quizzes.size() + " Quiz load");
        }

        catch (Exception e) {
            System.err.println("Error Quiz not load " + e.getMessage());
        }
    }


    public List<Quiz> getAllQuizzes() {
        return quizzes;
    }


    public Optional<Quiz> getQuizById(String id) {
        return quizzes.stream()
                .filter(q -> q.id().equals(id))
                .findFirst();
    }
}
