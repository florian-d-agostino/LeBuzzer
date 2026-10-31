package LaPlateforme.LeBuzzer.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;



@Configuration
@EnableWebSocketMessageBroker




public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    // Broker configuration
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // Outgoing topic
        config.enableSimpleBroker("/topic");

        // Incoming app prefix
        config.setApplicationDestinationPrefixes("/app");

    }



    // Stomp endpoint registration
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        // Websocket endpoint with SockJS and CORS
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

    }

}
