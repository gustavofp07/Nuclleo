package br.cefetmg.nuclleo.services;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Mantém as conexões SSE abertas (uma ou mais por usuário) e envia eventos
 * em tempo real, como "você foi expulso/banido da comunidade X".
 *
 * Obs.: guarda as conexões em memória, então funciona com 1 instância do backend.
 */
@Service
public class ComunidadeEventosService {

    private final Map<Long, List<SseEmitter>> conexoes = new ConcurrentHashMap<>();

    public SseEmitter registrar(Long cdUsuario) {
        SseEmitter emitter = new SseEmitter(0L); // sem timeout; o navegador reconecta sozinho se cair

        conexoes.computeIfAbsent(cdUsuario, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remover(cdUsuario, emitter));
        emitter.onTimeout(() -> remover(cdUsuario, emitter));
        emitter.onError(e -> remover(cdUsuario, emitter));

        try {
            // Evento inicial: confirma a conexão e faz o front revalidar o vínculo
            emitter.send(SseEmitter.event().name("conectado").data("ok"));
        } catch (IOException e) {
            remover(cdUsuario, emitter);
        }

        return emitter;
    }

    /** tipo: "EXPULSO" ou "BANIDO" */
    public void notificar(Long cdUsuario, String tipo, Long cdComunidade) {
        List<SseEmitter> lista = conexoes.get(cdUsuario);
        if (lista == null) {
            return;
        }

        Map<String, Object> payload = Map.of("tipo", tipo, "cdComunidade", cdComunidade);

        for (SseEmitter emitter : lista) {
            try {
                emitter.send(SseEmitter.event()
                        .name("comunidade")
                        .data(payload, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                remover(cdUsuario, emitter);
            }
        }
    }

    /** Ping periódico pra proxies/hospedagem não derrubarem a conexão ociosa. */
    @Scheduled(fixedRate = 25000)
    public void heartbeat() {
        conexoes.forEach((cdUsuario, lista) -> {
            for (SseEmitter emitter : lista) {
                try {
                    emitter.send(SseEmitter.event().comment("ping"));
                } catch (Exception e) {
                    remover(cdUsuario, emitter);
                }
            }
        });
    }

    private void remover(Long cdUsuario, SseEmitter emitter) {
        List<SseEmitter> lista = conexoes.get(cdUsuario);
        if (lista != null) {
            lista.remove(emitter);
        }
    }
}